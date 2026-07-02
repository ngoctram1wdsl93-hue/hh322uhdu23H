"""
Origin & environment resolution for all SEO surfaces.

Resolution order for the public origin (scheme+host, no trailing slash):
  1. SEO_PUBLIC_ORIGIN env  (explicit, preferred)
  2. PUBLIC_BASE_URL / PUBLIC_APP_URL env
  3. the incoming request Host header (best-effort, request-time)

Environment (controls indexing rules) resolution order:
  1. SEO_ENV env  (production | staging | stage | preview | test | dev)
  2. inferred from the host:
       *.preview.emergentagent.com / localhost / 127.* / *.local  -> preview
       everything else                                            -> production
"""
from __future__ import annotations

import os
from typing import Optional

_NON_PROD_HOST_MARKERS = (
    "preview.emergentagent.com",
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    ".local",
    "ngrok",
    "vercel.app",
)

_NON_PROD_ENVS = {"dev", "development", "test", "testing", "preview", "stage", "staging", "qa"}


def _env_origin() -> str:
    return (
        os.environ.get("SEO_PUBLIC_ORIGIN")
        or os.environ.get("PUBLIC_BASE_URL")
        or os.environ.get("PUBLIC_APP_URL")
        or ""
    ).strip().rstrip("/")


def get_origin(request=None) -> str:
    """Return the canonical public origin, e.g. https://eco-nova.ua (no slash)."""
    env = _env_origin()
    if env:
        return env
    # Fall back to the request host so we never emit an empty <loc>.
    if request is not None:
        try:
            host = request.headers.get("x-forwarded-host") or request.headers.get("host") or ""
            proto = (
                request.headers.get("x-forwarded-proto")
                or (request.url.scheme if getattr(request, "url", None) else "https")
            )
            if host:
                return f"{proto}://{host}".rstrip("/")
        except Exception:
            pass
    return ""


def get_environment(request=None) -> str:
    """Return a normalized environment name."""
    explicit = (os.environ.get("SEO_ENV") or "").strip().lower()
    if explicit:
        if explicit in ("prod", "production", "live"):
            return "production"
        return explicit
    origin = get_origin(request).lower()
    for marker in _NON_PROD_HOST_MARKERS:
        if marker in origin:
            return "preview"
    return "production" if origin else "preview"


def is_production(request=None) -> bool:
    env = get_environment(request)
    return env == "production"
