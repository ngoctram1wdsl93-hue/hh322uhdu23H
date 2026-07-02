# SEO Production Hardening — Delivery Plan (ECO.NOVA)

## 1) Objectives
- Eliminate **all BiBi Cars / bibicars.bg SEO legacy** across frontend + backend (zero stale canonicals/hreflang/sitemaps/OG/Schema/etc.).
- Build a **centralized SEO platform** (backend-driven engines + frontend SeoHead) that generates consistent, production-grade SEO surfaces.
- Ensure every public route has **unique, human-grade metadata** + **validated JSON‑LD** + **correct canonical/hreflang**.
- Provide **dynamic sitemap + robots per environment** (prod indexable, non-prod noindex/disallow).
- Add **SSR/prerender for crawlers** so Google receives ready HTML (not a templated SPA shell).
- Harden public content to **E‑E‑A‑T** and avoid AI‑template signals (no stuffing, no hacks).
- Finish with a **SEO Audit Report** + Lighthouse/CWV validation.

## 2) Implementation Steps

### Phase 1 — Core SEO Engines POC (isolation; must be green before UI)
**Goal:** Prove we can generate correct SEO outputs (robots/sitemap/canonical/hreflang) from a single origin and with env rules.

User stories:
1. As an operator, I can set a single public origin (SEO_PUBLIC_ORIGIN) and all SEO outputs use it.
2. As Googlebot, I receive a valid **robots.txt** that points to sitemap and allows indexing only in production.
3. As Googlebot, I receive a valid **sitemap index** that references typed sitemaps with lastmod.
4. As a user, canonical URLs never include utm/fbclid/gclid/session/preview parameters.
5. As a bilingual visitor, every indexable page declares correct hreflang (uk/en/x-default) without loops.

Work:
- Create `backend/app/seo/` package:
  - `origin.py` (resolve origin from env + optional admin override)
  - `canonical.py` (strip trackers, normalize scheme/host)
  - `hreflang.py` (uk/en/x-default map)
  - `robots.py` (env-aware: dev/test/preview/stage disallow + noindex)
  - `sitemap.py` (sitemap index + typed sitemap generators)
- Replace legacy `backend/app/routers/seo.py` with new engines (remove `/cars`, `vin_data`, `collections`).
- Replace static `frontend/public/robots.txt` & `frontend/public/sitemap.xml` with thin stubs OR redirect to dynamic endpoints.
- Add POC script `backend/scripts/poc_seo_engines.py` that:
  - calls `/robots.txt`, `/sitemap.xml` (index), typed sitemaps
  - validates XML well-formedness + required fields + canonical stripping
  - checks **zero “bibicars”** in any output.

Exit criteria:
- POC script green; curl-based checks pass; no bibicars strings anywhere in SEO surfaces.

---

### Phase 2 — V1 App Development (Dynamic metadata + JSON‑LD + admin wiring)
**Goal:** Implement per-route SEO head generation and structured data; wire admin SEO settings for verification/analytics.

User stories:
1. As a visitor, each public page has a unique Title/Description/OG/Twitter and correct canonical.
2. As Google, I can parse JSON‑LD for Organization/Website/Breadcrumbs/Service/FAQ/Article with no schema errors.
3. As an editor, I can update default SEO identity + verification tokens in CRM without redeploy.
4. As a bilingual user, I see correct hreflang tags and localized meta where applicable.
5. As an operator, legacy meta (author/publisher/locale/canonicals) never references BiBi Cars.

Work:
- Frontend: replace `useSeo()` with `SeoHead` component that renders:
  - title, description, canonical, robots meta, OG/Twitter, hreflang, JSON‑LD, breadcrumbs
  - per-route templates for: `/`, `/services`, `/calculator`, `/waste`, category, code, `/licenses`, `/industries`, `/about`, `/contacts`, `/blog`, `/blog/:slug`, legal pages.
- Backend: `backend/app/seo/schema.py` for JSON‑LD builders:
  - Organization/Corporation/LocalBusiness (config-driven, no fabricated facts)
  - WebSite + SearchAction, BreadcrumbList
  - Service, FAQPage, Article, WebPage, ContactPoint, PostalAddress, GeoCoordinates
  - SoftwareApplication for calculator
- Admin SEO settings:
  - extend `seo_settings` schema for EEAT fields (license number, address, geo, founding date, team page refs) with placeholders when unknown
  - ensure `/api/seo/runtime-config` emits only safe public subset
  - ensure admin UI page (existing) can edit these fields.
- Remove/replace stale static `index.html` head defaults:
  - canonical/hreflang/og/url/locale/author/publisher updated to ECO.NOVA + env-driven origin.

Testing:
- E2E: validate meta/OG/Twitter/hreflang on core routes in both languages.
- Rich Results smoke: schema JSON‑LD present + syntactically valid.

---

### Phase 3 — Rendering for SEO (Prerender/SSR for crawlers)
**Goal:** Ensure Google receives ready HTML (head + optionally body) for public routes.

User stories:
1. As Googlebot, I receive server-generated HTML with full meta tags on first byte.
2. As a user, site behavior remains identical (no cloaking; same content), just faster indexing.
3. As an operator, prerender is cached and does not overload the server.
4. As a developer, non-prod environments remain noindex/disallowed.
5. As a content editor, changes propagate to prerender cache within minutes.

Work:
- Implement backend middleware/router for bot detection (Googlebot/Bingbot + generic crawlers) and:
  - inject full `<head>` into the HTML shell (always)
  - optionally Playwright-based full-body prerender for a whitelist of public routes (cached, TTL, safe fallbacks)
- Add cache invalidation hooks for blog/site-info updates.

Testing:
- Curl with bot UA → receives enriched HTML.
- Lighthouse SEO on prerendered pages.

---

### Phase 4 — Content & E‑E‑A‑T Hardening (human, original, verifiable)
**Goal:** Replace AI-templated public content with expert, original copy and real corporate signals.

User stories:
1. As a prospect, I read clear, expert explanations with real examples and practical guidance.
2. As Google, I see authors, dates, sources, and corporate proof (licenses/contacts/location).
3. As an admin, I can edit public copy, FAQs, and EEAT blocks without code changes.
4. As a visitor, each service/waste category has unique content (no duplication across pages).
5. As a reviewer, no page uses keyword stuffing or repetitive AI phrasing.

Work:
- Create content rewriting backlog for all public pages (UA first, EN second).
- Add author profiles + updated/published dates for blog and key pages.
- Add “Licenses & documents” page section with real uploads (admin-managed), no fabricated IDs.
- Add real-case studies module (admin-managed) with photos and outcomes.

Testing:
- Manual review checklist (duplication, tone, EEAT completeness) + internal linking coverage.

---

### Phase 5 — Perf, Images, Crawl, Semantics, Accessibility
**Goal:** Achieve green CWV and a crawl-friendly, accessible semantic structure.

User stories:
1. As a mobile user, pages load fast (LCP/INP/CLS in green) and images don’t shift layout.
2. As Google, I can crawl via strong internal linking, breadcrumbs, and related content blocks.
3. As a screen-reader user, the site is navigable and properly labeled.
4. As an editor, images automatically get correct dimensions and responsive formats.
5. As an operator, broken links/404s/redirects are tracked and fixed.

Work:
- Image pipeline: ensure width/height, lazy loading, srcset/sizes, WebP/AVIF where possible, preload hero.
- Code-splitting for public routes; font-display; reduce render-blocking.
- Semantic HTML refactor on key pages (header/main/section/article/nav/footer).
- A11y pass: ARIA labels, focus states, contrast, keyboard navigation.

Testing:
- Lighthouse (SEO + Best Practices + Perf), CWV checks, broken link scan.

---

### Phase 6 — Final Audit + SEO Audit Report
**Goal:** produce a measurable, repeatable SEO baseline.

User stories:
1. As an owner, I get a report with what changed and what’s next.
2. As a marketer, Search Console verification + analytics hooks are ready.
3. As Google, I see consistent canonical/hreflang/sitemap/robots across the site.
4. As a QA, I can confirm no duplicate titles/descriptions/H1.
5. As an operator, redirects/404s are handled cleanly.

Deliverables:
- SEO Audit Report: changes, Lighthouse/CWV numbers, schema types list, sitemap map, fixed-issues list.

## 3) Next Actions
1. Confirm production domain (or keep env-only via `SEO_PUBLIC_ORIGIN` until ready).
2. Collect EEAT facts you can provide now (license number, address, geo, company docs, team photos) — otherwise keep placeholders.
3. Start Phase 1: implement new `backend/app/seo/` engines + POC script and remove `/cars` sitemap logic.

## 4) Success Criteria
- Zero BiBi Cars artifacts (`bibicars`, car routes, bg_BG, wrong author/publisher) in code + runtime SEO outputs.
- Dynamic `robots.txt` and multi-sitemap system valid XML, env-aware indexing rules.
- Per-route metadata + JSON‑LD validated (Rich Results Test passes; no schema errors).
- Googlebot receives ready HTML (head at minimum; body prerender for critical pages).
- Lighthouse ≥95 SEO and ≥95 Best Practices on key public pages; CWV green on mobile.
- Content is human-grade, non-duplicative, EEAT-complete with real verifiable company signals.
