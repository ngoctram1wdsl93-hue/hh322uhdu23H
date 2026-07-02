"""
Environment-aware robots.txt engine.

  * production  -> allow public pages, disallow private app/api areas,
                   advertise the sitemap index.
  * non-prod    -> Disallow: /  (so preview/stage/test never get indexed
                   and can't dilute the production domain's authority).

No hidden directives, no cloaking — the rules are honest and standard.
"""
from __future__ import annotations

from .origin import get_origin, get_environment

# Private surfaces that must never be crawled, even in production.
_DISALLOW_PROD = (
    "/app",          # staff CRM workspace
    "/admin",        # staff login/console
    "/client",       # B2B client cabinet
    "/api/",         # backend API
    "/contract/",    # tokenized e-sign links
    "/*?preview=",
    "/*?draft=",
)


def build_robots(request=None) -> str:
    origin = get_origin(request)
    env = get_environment(request)
    sitemap = f"{origin}/sitemap.xml" if origin else "/sitemap.xml"

    lines = [
        "# ECO.NOVA — robots.txt (generated)",
        f"# environment: {env}",
        "",
    ]

    if env != "production":
        # Keep non-production entirely out of the index.
        lines += [
            "User-agent: *",
            "Disallow: /",
            "",
            f"Sitemap: {sitemap}",
            "",
        ]
        return "\n".join(lines)

    lines += ["User-agent: *"]
    for path in _DISALLOW_PROD:
        lines.append(f"Disallow: {path}")
    lines += [
        "Allow: /$",
        "Allow: /waste",
        "Allow: /calculator",
        "Allow: /contacts",
        "Allow: /blog",
        "Allow: /terms",
        "Allow: /privacy",
        "Allow: /cookies",
        "",
        "# Reputable crawlers — full access to public content",
        "User-agent: Googlebot",
        "Disallow: /app",
        "Disallow: /admin",
        "Disallow: /client",
        "Disallow: /api/",
        "",
        "User-agent: Bingbot",
        "Disallow: /app",
        "Disallow: /admin",
        "Disallow: /client",
        "Disallow: /api/",
        "",
        f"Sitemap: {sitemap}",
        "",
    ]
    return "\n".join(lines)
