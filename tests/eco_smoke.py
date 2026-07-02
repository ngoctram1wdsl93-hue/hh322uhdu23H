#!/usr/bin/env python3
"""ECO smoke test — verifies live ECO/CRM endpoints stay 200 and auto endpoints are gone.

Run:  python3 /app/tests/eco_smoke.py
Exit code 0 = all ECO/CRM endpoints OK. Non-zero = regression.
"""
import sys
import json
import urllib.request
import urllib.error

BASE = "http://localhost:8001"
ADMIN = {"email": "admin@bibi.cars", "password": "Admin12345!"}


def _req(method, path, token=None, body=None):
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()
    except Exception as e:
        return -1, str(e)


def main():
    failures = []

    # 1. Admin login
    st, bd = _req("POST", "/api/auth/login", body=ADMIN)
    if st != 200:
        print(f"FATAL: admin login failed {st}: {bd[:200]}")
        sys.exit(2)
    token = json.loads(bd)["access_token"]
    print("OK   login admin -> 200")

    # 2. ECO / CRM endpoints that MUST stay 200
    live = [
        ("GET", "/api/health", None),
        ("GET", "/api/waste/categories", None),
        ("GET", "/api/waste/codes?limit=5", None),
        ("GET", "/api/waste/stats", token),
        ("GET", "/api/waste/companies", token),
        ("GET", "/api/waste/requests", token),
        ("GET", "/api/waste/licenses", token),
        ("GET", "/api/waste/price_rules", token),
        ("GET", "/api/auth/me", token),
        ("GET", "/api/leads", token),
        ("GET", "/api/customers", token),
        ("GET", "/api/tasks", token),
        ("GET", "/api/invoices/analytics", token),
        ("GET", "/api/staff-center/overview", token),
        ("GET", "/api/documents", token),
        ("GET", "/api/public/contacts", None),
    ]
    for method, path, tok in live:
        st, bd = _req(method, path, tok)
        ok = st in (200, 201)
        tag = "OK  " if ok else "FAIL"
        print(f"{tag} {method} {path} -> {st}")
        if not ok:
            failures.append((path, st, bd[:160]))

    # 3. AUTO endpoints that SHOULD be gone (404/410/403). 200 = still alive (report).
    gone = [
        ("GET", "/api/scraped/vehicles", token),
        ("GET", "/api/bulk/vehicle/TESTVIN123", token),
        ("GET", "/api/calculator/ports", token),
        ("GET", "/api/calculator/config/auction-fees/copart", token),
        ("GET", "/api/source-health", token),
        ("GET", "/api/team/shipping", token),
        ("GET", "/api/shipping/me", token),
        ("GET", "/api/debug/shipments-count", token),
        ("GET", "/api/v2/search/TESTVIN123", token),
    ]
    still_alive = []
    print("\n-- auto endpoints (expect NOT 200) --")
    for method, path, tok in gone:
        st, bd = _req(method, path, tok)
        alive = st in (200, 201)
        tag = "ALIVE" if alive else "gone "
        print(f"{tag} {method} {path} -> {st}")
        if alive:
            still_alive.append((path, st))

    print("\n==================== SUMMARY ====================")
    print(f"ECO/CRM live failures: {len(failures)}")
    for p, s, b in failures:
        print(f"   FAIL {p} -> {s} | {b}")
    print(f"auto endpoints still alive: {len(still_alive)}")
    for p, s in still_alive:
        print(f"   ALIVE {p} -> {s}")

    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
