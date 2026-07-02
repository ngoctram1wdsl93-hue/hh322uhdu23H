#!/usr/bin/env bash
# =============================================================================
#  ECO Platform — One-Command Bootstrap / Quick Bring-up
# =============================================================================
#  Brings a freshly-cloned checkout (from GitHub) to a fully RUNNING state with
#  a single command, idempotently:
#
#     bash scripts/bootstrap.sh
#
#  Steps:
#    1) backend  Python deps        (pip install -r requirements.txt)
#    2) frontend deps               (yarn install --ignore-engines)
#    3) ensure required .env keys   (seed creds, JWT secret, CORS, flags)
#         · NEVER touches MONGO_URL / DB_NAME / REACT_APP_BACKEND_URL (managed)
#         · only APPENDS missing keys — existing values are preserved
#    4) (re)start services          (supervisorctl restart backend frontend)
#    5) wait for backend health     (+ auto-seed waste catalog on startup)
#    6) smoke check                 (admin + manager + client login, waste stats)
#
#  Requirements: supervisor, python3/pip, yarn, MongoDB already provisioned by
#  the platform. The script is safe to re-run any number of times.
# =============================================================================
set -uo pipefail

APP_DIR="/app"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
BACKEND_ENV="$BACKEND_DIR/.env"

# ── Canonical demo credentials (override by exporting before running) ────────
ADMIN_EMAIL="${BIBI_ADMIN_EMAIL:-admin@eco.ua}"
ADMIN_PASS="${BIBI_ADMIN_PASSWORD:-EcoAdmin2026!}"
MANAGER_EMAIL="${BIBI_MANAGER_EMAIL:-manager@eco.ua}"
MANAGER_PASS="${BIBI_MANAGER_PASSWORD:-EcoManager2026!}"
CLIENT_EMAIL="${BIBI_CLIENT_EMAIL:-client@eco.ua}"
CLIENT_PASS="${BIBI_CLIENT_PASSWORD:-EcoClient2026!}"

RED=$'\033[0;31m'; GRN=$'\033[0;32m'; YLW=$'\033[0;33m'; BLU=$'\033[0;36m'; NC=$'\033[0m'
log()  { printf "%s[bootstrap]%s %s\n" "$GRN" "$NC" "$*"; }
warn() { printf "%s[bootstrap]%s %s\n" "$YLW" "$NC" "$*"; }
err()  { printf "%s[bootstrap]%s %s\n" "$RED" "$NC" "$*"; }
step() { printf "\n%s== %s ==%s\n" "$BLU" "$*" "$NC"; }

FAIL=0

# ── 1. Backend deps ──────────────────────────────────────────────────────────
step "1/6 Backend dependencies"
if [ -f "$BACKEND_DIR/requirements.txt" ]; then
  if pip install -q -r "$BACKEND_DIR/requirements.txt"; then
    log "Backend deps installed."
  else
    warn "pip reported issues (continuing — usually just a resolver warning)."
  fi
else
  warn "requirements.txt not found — skipping backend deps."
fi

# ── 2. Frontend deps ─────────────────────────────────────────────────────────
# NOTE: a transitive dep (camera-controls) declares node>=22 while the image
# ships node 20 → we MUST pass --ignore-engines or the install aborts.
step "2/6 Frontend dependencies"
if [ -f "$FRONTEND_DIR/package.json" ]; then
  ( cd "$FRONTEND_DIR" && yarn install --ignore-engines --frozen-lockfile ) \
    || ( cd "$FRONTEND_DIR" && yarn install --ignore-engines ) \
    || { err "yarn install failed."; FAIL=1; }
  log "Frontend deps installed."
else
  warn "frontend/package.json not found — skipping frontend deps."
fi

# ── 3. Ensure required .env keys (append-only, managed keys untouched) ───────
step "3/6 Ensure backend .env keys"
touch "$BACKEND_ENV"
ensure_env() {  # ensure_env KEY VALUE  — appends "KEY=\"VALUE\"" only if KEY absent
  local key="$1" val="$2"
  if grep -qE "^[[:space:]]*${key}=" "$BACKEND_ENV"; then
    return 0
  fi
  printf '%s="%s"\n' "$key" "$val" >> "$BACKEND_ENV"
  log "  + added $key"
}
# JWT secret — generate a stable one if absent (survives restarts; avoids the
# per-pod in-memory fallback).
if ! grep -qE '^[[:space:]]*JWT_SECRET=' "$BACKEND_ENV"; then
  JWT_GEN="$(python3 -c 'import secrets;print(secrets.token_urlsafe(48))' 2>/dev/null || echo "change-me-$(date +%s)")"
  ensure_env "JWT_SECRET" "$JWT_GEN"
fi
ensure_env "CORS_ORIGINS"        "https://*.preview.emergentagent.com,https://*.emergentagent.com,http://localhost:3000,http://localhost:8001"
ensure_env "BIBI_ADMIN_EMAIL"    "$ADMIN_EMAIL"
ensure_env "BIBI_ADMIN_PASSWORD" "$ADMIN_PASS"
ensure_env "BIBI_MANAGER_EMAIL"  "$MANAGER_EMAIL"
ensure_env "BIBI_MANAGER_PASSWORD" "$MANAGER_PASS"
ensure_env "BIBI_CLIENT_EMAIL"   "$CLIENT_EMAIL"
ensure_env "BIBI_CLIENT_PASSWORD" "$CLIENT_PASS"
ensure_env "BIBI_CLIENT_NAME"    "Demo Client"
ensure_env "ALLOW_DEV_LOGIN"     "true"
ensure_env "OPS_HEAL_ENABLED"    "false"
log "backend/.env ready (MONGO_URL / DB_NAME left untouched)."

# ── 4. (Re)start services ────────────────────────────────────────────────────
step "4/6 Restart services"
supervisorctl restart backend  >/dev/null 2>&1 || warn "could not restart backend via supervisor"
supervisorctl restart frontend >/dev/null 2>&1 || warn "could not restart frontend via supervisor"
log "backend + frontend restarted."

# ── 5. Wait for backend health ───────────────────────────────────────────────
step "5/6 Wait for backend health"
BASE="$(grep -E '^REACT_APP_BACKEND_URL=' "$FRONTEND_DIR/.env" 2>/dev/null | cut -d= -f2- | tr -d '"' || true)"
BASE="${BASE:-http://localhost:8001}"
# Prefer localhost for in-container health (avoids ingress timing).
HEALTH_BASE="http://localhost:8001"
log "Health base: $HEALTH_BASE   (public base: $BASE)"
UP=0
for i in $(seq 1 40); do
  if curl -fsS "$HEALTH_BASE/api/waste/categories" >/dev/null 2>&1; then
    UP=1; log "Backend is up (waste catalog responding, auto-seed complete)."; break
  fi
  sleep 2
done
[ "$UP" -eq 1 ] || { err "Backend health check timed out — see /var/log/supervisor/backend.*.log"; FAIL=1; }

# ── 5b. Seed ECO analytics demo data (idempotent; demo-tagged docs only) ──────
step "5b/6 Seed ECO analytics demo data"
if ( cd "$BACKEND_DIR" && python -m scripts.seed_eco_demo ) 2>/dev/null; then
  log "ECO demo data seeded (deals/contracts/payments/leads/pickups)."
else
  warn "ECO demo seed skipped/failed (non-fatal)."
fi

# ── 6. Smoke check (logins + stats) ──────────────────────────────────────────
step "6/6 Smoke check"
login_staff() {  # login_staff EMAIL PASS  → echoes token (or empty)
  curl -fsS -X POST "$HEALTH_BASE/api/auth/login" -H 'Content-Type: application/json' \
    -d "{\"email\":\"$1\",\"password\":\"$2\"}" 2>/dev/null \
    | python3 -c 'import sys,json;print(json.load(sys.stdin).get("access_token",""))' 2>/dev/null || true
}

ADMIN_TOKEN="$(login_staff "$ADMIN_EMAIL" "$ADMIN_PASS")"
if [ -n "$ADMIN_TOKEN" ]; then log "admin   login OK  ($ADMIN_EMAIL)"; else err "admin   login FAILED ($ADMIN_EMAIL)"; FAIL=1; fi

MGR_TOKEN="$(login_staff "$MANAGER_EMAIL" "$MANAGER_PASS")"
if [ -n "$MGR_TOKEN" ]; then log "manager login OK  ($MANAGER_EMAIL)"; else err "manager login FAILED ($MANAGER_EMAIL)"; FAIL=1; fi

CLIENT_OK="$(curl -fsS -X POST "$HEALTH_BASE/api/customer-auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$CLIENT_EMAIL\",\"password\":\"$CLIENT_PASS\"}" 2>/dev/null \
  | python3 -c 'import sys,json;print("ok" if json.load(sys.stdin).get("accessToken") else "")' 2>/dev/null || true)"
if [ -n "$CLIENT_OK" ]; then log "client  login OK  ($CLIENT_EMAIL)"; else err "client  login FAILED ($CLIENT_EMAIL)"; FAIL=1; fi

if [ -n "$ADMIN_TOKEN" ]; then
  curl -fsS "$HEALTH_BASE/api/waste/stats" -H "Authorization: Bearer $ADMIN_TOKEN" 2>/dev/null \
    | python3 -c 'import sys,json;d=json.load(sys.stdin);print("  waste catalog → codes=%s companies=%s requests=%s contracts=%s acts=%s"%(d.get("codes"),d.get("companies"),d.get("requests"),d.get("contracts"),d.get("acts")))' 2>/dev/null \
    || warn "waste stats parse failed"
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
if [ "$FAIL" -eq 0 ]; then
  printf "%s✓ ECO platform is UP.%s\n" "$GRN" "$NC"
  echo   "  Public site : $BASE/"
  echo   "  Staff (CRM) : $BASE/admin    → admin@eco.ua / EcoAdmin2026!  ·  manager@eco.ua / EcoManager2026!"
  echo   "  Client B2B  : $BASE/client/login → client@eco.ua / EcoClient2026!"
  echo   "  See PROJECT_STATE.md / DEPLOYMENT.md for structure & status."
  exit 0
else
  printf "%s✗ Bootstrap finished WITH ERRORS.%s See logs: /var/log/supervisor/backend.*.log\n" "$RED" "$NC"
  exit 1
fi
