# ECO — Платформа утилізації небезпечних відходів (B2B, Україна)

> **Єдине джерело правди про стан проєкту.** Оновлюється після кожної значущої віхи.
> Базовий продукт — форк CRM (BiBi Cars), у якому авто-домен знешкоджено, а зверху
> збудовано Waste-домен + Operations Center + публічний сайт + Client Portal.
>
> Мова продукту/UI: **українська**. Стек: FastAPI (Python 3.11) + React 19 +
> Tailwind + shadcn/ui + MongoDB.

> **✨ 2026-07-02 — LEGAL/FOOTER POLISH (favicon + access-card ЗАЛИШЕНО ЯК БУЛО).**
> (1) Фавікон: залишено ОРИГІНАЛЬНИЙ знак-лист (за рішенням користувача редизайн відкочено;
> cache-bust `?v=eco5`). (2) Секція «кабінет» на хоум: оригінальний дизайн бейджа/кнопок
> збережено (тимчасовий контраст-редизайн відкочено на вимогу користувача — НЕ ЧІПАТИ).
> (3) Футер, нижній бар перебудовано на grid: policy-лінки (Terms/Privacy/Cookies) тепер
> строго по центру сторінки; «Website made by EVA-X» → https://eva-x.cx з ПІДКРЕСЛЕННЯМ
> (клікабельність очевидна). (4) Копірайт доменний: «ліцензована утилізація небезпечних
> відходів 1–4 класів за кодами нацкласифікатора» (uk+en, EcoFooter.js). (5) Політики суттєво
> розширено (legal_texts.py + sync у Mongo): Terms 22 розділи (нотифікації, SLA/підтримка,
> відступлення, severability, мовні версії), Privacy 18 (автоматизовані рішення, breach
> notification, CCTV), Cookies 11 (інвентар технологій, session/persistent, DNT/GPC, наслідки
> відмови). testing_agent_v3: backend 13/13 релевантних, frontend 17/17 — 0 багів.

> **✨ 2026-07 — MORPHING CALL FAB + COMPACT COOKIE BANNER + PUBLIC LEGAL PAGES.**
> (1) «Замовити дзвінок»: плаваюча кнопка (іконка-only, з pulse) тепер САМА морфиться у картку
> звернення (width/height/radius/color transition + cross-fade контенту, ResizeObserver-height,
> Esc/scrim close) — `InquiryModal.js/.css` переписані, `InquiryFab` прибрано з `PublicLayout`;
> легасі `.inq-card` збережено для клієнтського `NewRequestModal`. (2) Кукі-банер компактний
> (324px, іконка Cookie, менші кнопки) — текст/вимикач редагуються з адмінки (Info → Cookie Banner).
> (3) Legal-сторінки зароучено публічно: `/terms` `/privacy` `/cookies` (LegalPage + контент з
> `/api/site-info/policy/*`), у футері 3 лінки (Terms of Use / Privacy Policy / Cookies Policy),
> редагування — CRM → Контент сайту → «Політики та інфо» (`/app/info`, новий пункт сайдбару).
> testing_agent_v3: backend 16/16, frontend public 8/8, admin 6/6 — 100%, 0 багів.

> **🧹 2026-06 — CRM LEAD-SOURCE GENERICIZED (follow-up to parser purge).** Прибрано Copart/Encar/IAAI
> з ЖИВОЇ CRM: видалено осиротілі `pages/Sales.js` + `pages/Contract360.js` (дублі — реальний роут
> це `pages/portal/Contract360.js`, чистий). У живому `components/customer360/SalesTab.jsx` список
> авто-аукціонів (`copart/iaai/manheim/...`) → generic `LEAD_SOURCES` (Website/Referral/Phone/Email/
> Cold outreach/Exhibition/Partner/Repeat client/Other), поле «Auction» → «Lead source / Джерело ліда»
> (+ i18n ключ `sales_lead_source`, бек-ключ `auction` лишився — без міграції). Зачищено поодинокі
> згадки: blog tag-placeholder, коментарі в `optimizeImage.js` / `CustomSelect.js`. РЕЗУЛЬТАТ: 0
> copart/encar/iaai/parser у живому фронт-коді. Залишок (поза скоупом цього кроку): SalesTab досі має
> авто-поля (VIN/Lot/Make/Model) + бекенд авто-домен (`workflow_templates` USA import, `wave11`
> auction-bidding, `calculator_constants` AUCTION_FEES) — інертні, на окремий крок за бажанням.

> **🧹 2026-06 — PARSER/AUCTION DEAD-CODE PURGE (root cause of «it keeps coming back»).**
> ПРИЧИНА рецидиву: попередні чистки чіпали ЛИШЕ бекенд (`server.py` — тільки tombstone-коментарі
> `[auto-domain removed]`), а ФРОНТ + i18n + бекап-файли НІКОЛИ реально не видалялись → кожен
> свіжий `git clone` знову «знаходив» їх. Видалено НАСПРАВДІ (git tracked `D`):
>   • `backend/.server_py.bak_precleanup` (874KB) + `.server_py.bak_vincleanup` (726KB) — ті самі
>     «бекапи», з яких усе воскресало (1.6MB старого авто-коду);
>   • `frontend/src/pages/admin/AdminGuidePage.jsx` — авто-імпорт whitepaper (Copart/auction/VIN/parser);
>   • `frontend/src/components/Layout.js` — старий CRM-сайдбар з пунктом меню «VIN Parser» → `/admin/parser`;
>   • `frontend/src/pages/NotificationsPage.js` — нотифікації parser_completed/parser_failed;
>   • `backend/data/vehicle_catalog.py` + `backend/data/canonical.py` — авто-каталог + канонізація скрейпера;
>   • 338×2 мертвих i18n-ключів (parser/vessel/copart/iaai/vin/auction-catalog/proxy) — лише
>     НЕвикористовувані ключі (перевірено по всьому src). translations.js: 15610 → ~13.6k рядків.
> Runtime чистий: активних parser/scraper воркерів НЕМАЄ, `/api/calculations` (авто-калькулятор) НЕ
> зареєстрований, parser-ендпоінти віддають 401 (немає роуту). Залишок (СВІДОМО): поодинокі слова
> «Copart/Encar» як lead-source у ЖИВОМУ kept-CRM (`Sales.js`/`Contract360.js`/`SalesTab.jsx`) +
> інертний `deps.py` bitmotors-міст (BITMOTORS_AVAILABLE=False, не виконується). Перевірено: бекенд
> 200, фронт компілюється, калькулятор/консоль оператора рендеряться без raw-ключів.

> **🏷 2026-06 — REBRAND: ECO → ECO.NOVA (Еко-нова).** Єдина бренд-логіка по всій платформі.
> Логотип/вордмарк скрізь: **ECO** + зелена крапка-акцент **.** + **NOVA** (NOVA трохи легша/прозоріша
> для ієрархії — переосмислення наявного dot-мотиву, а не «ECO NOVA» з пробілом). Оновлено:
> публічний хедер (`EcoNav`), футер (бренд + гігантський вордмарк + copyright + юр.особа «ТОВ
> «ЕКО-НОВА»»), меню-watermark, сайдбар оператора (`ECO.NOVA · CRM`), адмін-логін (desktop+mobile+
> copy+SEO), кабінет клієнта (login/register/reset/auth-shell/sidebar), generic Login, WasteContractSign,
> `index.html` (title/meta/OG/Twitter), SEO-суфікс (`lib/seo.js`) + SEO-тайтли сторінок, бекенд 2FA
> issuer (`security_router.py`), i18n бренд-лейбли (AI-провайдер, team-note, copyright, SMS, footer).
> Залишок: ретайрнутий авто-домен (`BIBI Cars Parser`/Copart рядки в dead i18n-ключах і
> `AdminGuidePage` — авто-контент) — поза рамками брендингу.

> **🛠 2026-06 — INQUIRY MODAL PHONE FIELD FIX.** Виправлено модалку «Замовити дзвінок /
> Request a call»: (1) подвійна іконка (телефон+глобус) → тепер один чистий глобус (intl)
> або прапор країни + шеврон; (2) дропдаун країн більше не ламає/зміщує/обрізає модалку —
> панель портується в `<body>` з `z-index` ВИЩЕ за оверлей модалки (.inq-overlay z:500),
> позиціонування viewport-aware (fixed, anchored до тригера). Працює однаково в EN та UK.
> Файли: `components/CountrySelect.jsx`, `components/PhoneField.css`. Перевірено візуально
> (EN+UK, desktop+mobile, пошук/вибір країни, повний submit → success).

> **📞 2026-06 — CALLS CONSOLE (Ringostat) ПЕРЕНЕСЕНО В ECO UI (admin+manager).**
> Відновлено повну логіку BibiCars кол-трекінгу у нашому фронті: єдина **Консоль
> дзвінків** `/app/crm/calls` (KPI + вкладки Усі/Очікують результату/Пропущені/
> Передзвони + фільтри період/напрям/менеджер/пошук), глобальний **банер дзвінків**
> у `PortalLayout` (лічильники + realtime Socket.IO toasts + кнопка «Заповнити
> результат»), діалог **результату дзвінка** (outcome+коментар обов'язкові,
> дата передзвону обов'язкова для `callback`) — лід не закриється без результату.
> Бек: новий `app/routers/calls_console.py` (`/api/manager/calls/summary|feed|
> awaiting-outcome|callbacks`, scope admin=all / manager=self) + ECO-outcome
> side-effects (reject→lost, deal→won, thinking→warm) у `save_manager_call_outcome`.
> Тестові ключі Ringostat (project 145693) під'єднано — з'єднання LIVE,
> налаштовується з `/app/ringostat`. testing_agent_v3: **backend 12/12 (100%),
> frontend 100%, 0 багів** (38 passed).


> **🧹 2026-06 — AUTO-DOMAIN CLEANUP EXECUTED.** Видалено 54 авто-ендпоінти + 26 хелперів з
> `server.py` (19,254→~16,820 рядків), 57 orphan авто-файлів з frontend, dead whitelist у
> `access_gate.py`, legacy 410 kill-switch. Регресія testing_agent_v3: backend 41/41 (100%),
> frontend 100%, 0 багів. Деталі: `CLEANUP_EXECUTION_2026.md`. Акаунти: admin@bibi.cars / Admin12345!, manager@bibi.cars / Manager12345!.

> **✅ 2026-06 — VIN-INGESTION RETIREMENT EXECUTED (раніше DEFERRED follow-up — ЗАКРИТО).**
> Прибрано dormant VIN-ingestion scaffolding із `server.py` (cold-start Bitmotors seed,
> Phase A1 `vin_data` індекси, Phase A2 enrichment, VIN→container→vessel automation індекси,
> parser/session/aggregator stub-блоки, `async_playwright` import, BidCars import; 15,720→15,556
> рядків); видалено 7 порожніх auto-колекцій Mongo (`vin_data`, `vin_container_links`,
> `shipment_identity_links`, `resolver_exceptions`, `vessel_candidates_tracking`,
> `vf_payload_meta/raw`, `compare`) — **0 документів, без втрати даних**; прибрано auto seed/migration
> скрипти. Інваріант-тести VIN/aggregator вже були retired. ECO-логіка (каталог/ліцензія/прайс)
> 100% ціла. testing_agent_v3: **3 кабінети (admin/manager/client) + core + регресія — backend 100%,
> frontend 100%, 0 багів.** Деталі: `AUDIT_VIN_INGESTION_RETIREMENT_2026.md`. Backup:
> `backend/.server_py_bak_vincleanup`.

---

## 0. Швидкий старт (Bootstrap) — ОДНА КОМАНДА

```bash
bash scripts/bootstrap.sh        # deps + .env + restart + seed + smoke-check
```

Ідемпотентний one-command bring-up: backend deps → frontend deps
(`yarn --ignore-engines`) → ensure `.env` (seed-креди / JWT / CORS / прапорці,
**без** зміни `MONGO_URL`/`DB_NAME`) → restart → health+seed → smoke-check
(admin+manager+client login). Деталі та структура розгортання: **`DEPLOYMENT.md`**.

- Backend: `http://localhost:8001` (через supervisor), API-префікс `/api`.
- Frontend: `http://localhost:3000` (через supervisor).
- Env (НЕ редагувати): `backend/.env:MONGO_URL`, `frontend/.env:REACT_APP_BACKEND_URL`.

**Тестові облікові записи (сідяться на кожному старті, idempotent):**
- Admin:   `admin@eco.ua` / `EcoAdmin2026!`   → `/admin` → `/app`
- Manager: `manager@eco.ua` / `EcoManager2026!` → `/admin` → `/app/cabinet`
- Client:  `client@eco.ua` / `EcoClient2026!`  → `/client/login` → `/client`

---

## 1. Архітектура

```
/app
├── backend/                     FastAPI (моноліт server.py ~28k рядків + app/*)
│   ├── server.py                legacy-CRM inline-роути (KEEP, живі)
│   ├── app/waste/               НОВИЙ Waste-домен (decoupled)
│   │   ├── seed_data.py         80 кодів / 16 категорій
│   │   ├── service.py           індекси, seed, smart-search, license, pricing v0
│   │   ├── router.py            Waste Core — 31 ендпоінт (/api/waste/*)
│   │   └── ops_router.py        Operations Center — 25 ендпоінтів
│   ├── app/middleware/access_gate.py   whitelist публічних waste-ендпоінтів
│   └── scripts/waste_core_poc.py, waste_ops_poc.py   backend POC-тести
└── frontend/                    React 19
    ├── src/lib/api.js           WasteAPI (public) + PortalAPI (staff) + AuthAPI
    ├── src/lib/portalMeta.js    лейбли/тони статусів, формат дат
    ├── src/components/portal/    PortalUI, CreateRequestDialog
    ├── src/pages/public/         публічний сайт + SEO-директорія + калькулятор
    └── src/pages/portal/         Client Portal (Dashboard/Companies/Company360/Requests/Operations)
```

**Документи-довідники:** `AUDIT_BIBICARS.md`, `AUDIT_BACKEND_MODULES.md` (keep/adapt/delete),
`design_guidelines.md` (UI), `plan.md` (5-Wave roadmap + progress log), `PROJECT_STATE.md` (цей файл).

---

## 2. Що ПЕРЕНЕСЕНО / ЗБУДОВАНО

### 2.1 Бекенд
- **Waste Core (31 ендпоінт)** — коди (каталог + admin CRUD + seed/import), smart-search,
  license-check, pricing (`/price`), компанії (CRUD + Company360-агрегат), об'єкти (CRUD),
  license matrix (CRUD), заявки (lifecycle new→quote→contract→pickup→utilization→act→archived), stats.
- **Operations Center (25 ендпоінтів)** — договори/вивози/акти (повний lifecycle + статуси +
  detail + edit), генерація доків із заявки, Object Center, таймлайн, завдання, коментарі.
- **Legacy-CRM кістяк (KEEP, ЖИВИЙ)** — leads/deals/customers/tasks/calls/invoices/payments/
  staff/team/manager/notifications/documents+PDF/contracts+e-sign/KPI/analytics/integrations.
  Підтверджено `200 OK` з admin-токеном. (Авто-скрапери/парсери/VIN знешкоджено через blocklists.)
- **Тести:** Waste Core 33/33, Operations 76/76 (POC + testing agent) — 100%.

### 2.2 Фронтенд
- **Публічний сайт:** Home, Services, Industries, About, Licenses, Contacts, Calculator,
  Waste Directory + Category + SEO Code page, Smart Search, публічна заявка.
- **Client Portal:** Login (JWT), Dashboard (KPI+воронка), Companies (список+пошук+створення),
  Company360 (6 вкладок), Requests (kanban+деталі+зміна етапу+генерація доків),
  Operations (договори/вивози/акти+зміна статусу).
- **Тести фронту:** testing agent — 100% pass, 0 багів.

---

## 3. ⚠️ РОЗРИВ «БЕК ↔ ФРОНТ» (Degradation report)

| Шар | Бек готовий | У ECO-фронті | Покриття |
|---|---|---|---|
| Waste Core + Operations | 65 ендпоінтів | ~33 | **~51%** |
| Legacy CRM (Wave 5A) | ~25 endpoints exposed | 6 CRM pages | **~100%** |
| Company360 (вкладки за дизайном) | 10 | 6 | **60%** |
| Legacy-CRM спина (live) | сотні ендпоінтів | 0 | **0%** |
| ADAPT (calc v2/NLP/PDF/pay/e-sign/compliance) | частково/планово | 0 | **0%** |

**Бек суттєво випереджає фронт.** Деталі гепів — у розділі 4 (TASKS).

---

## 4. ROADMAP (продуктові пріоритети — затверджено власником)

> Логіка пріоритезації: спершу те, що напряму впливає на ЛІДИ та комерційну
> готовність (ціна, прийом відходів, наповнення каталогу), потім операційний
> облік, далі підключення готового CRM, інтелект і лише наприкінці Compliance.

### ✅ Wave 4A — Комерційне ядро (ЗАВЕРШЕНО, 2026-06-16)
- [x] **Pricing Engine v2** — `waste_price_rules` (wasteCode, region, minWeight, maxWeight,
      containerType, transportRequired, urgent, pricePerKg, minimumCharge + опційні
      перевизначення тари/транспорту/терміновості); тариф рахується як
      `max(pricePerKg×weight, minimumCharge) × regionFactor + container + transport + urgent`.
      Бек: `GET/POST/PUT/DELETE /api/waste/price_rules`, `POST /api/waste/price_rules/seed`,
      публічний `GET /api/waste/pricing/meta`. `POST /api/waste/price` уже використовує engine v2.
      Фронт: `/app/pricing` — KPI, таблиця, CRUD-діалог, інтерактивний тест-калькулятор з
      breakdown по рядках (утилізація / мін.тариф / тара / транспорт / терміновість).
- [x] **License Matrix UI** — `/app/licenses`: KPI (усього / приймаємо / спливає 30дн /
      прострочено), пошук, CRUD-діалог з датою дії, авто-обчислення «прийнято/ні».
- [x] **Waste Directory Admin** — `/app/directory`: фільтри (категорія / небезпечний / пошук),
      CRUD усіх полів коду (народні назви, документи, ціна, мін.партія, прапори tara/transport/
      license/service), JSON-імпорт (upsert), CSV+JSON експорт, idempotent re-seed.
- **Тести:** backend POC `wave4a_poc.py` 38/38 ✓, testing_agent 93/93 backend + 95% frontend, 0 регресій.

### ✅ Wave 4B — Операційний облік (ЗАВЕРШЕНО, 2026-06-16)
- [x] **Operations Details** — універсальний `OperationDetailDrawer` (Contract/Pickup/Act),
      що відкривається з `/app/operations` та з вкладок Company360. Повна операційна
      картка з усіма полями: Contract (`title/amount/currency/valid_from/valid_to/file_id (PDF URL)/signed_by/signed_at`),
      Pickup (`scheduled_at/transport_type/container_type/weight_kg/route/driver.{name,phone,vehicle,gps}/photo_url/picked_up_at/delivered_at`),
      Act (`act_date/total_weight_kg/utilization_method/file_id/signed_by/signed_at`). Tabs **Деталі / Відходи / Історія** з timeline.
      Status select зі сторічниковими сайд-ефектами (`signed_at`, `picked_up_at`, `delivered_at`).
- [x] **Object Center UI** — нова сторінка `/app/objects/:id` з breadcrumb-навігацією, 5 KPI
      (заявки/вивози/акти/типи відходів/наступний вивіз), редагованим графіком вивозу
      (frequency/weekday/time/notes) та вкладками Заявки/Вивози/Акти/Відходи/Філії.
      Кліки на рядки вивозів та актів відкривають той самий drawer.
- [x] **Company360 Full** — 4 нові вкладки: **Огляд** (контакти + останні заявки + відкриті
      задачі + останній коментар + activity feed), **Завдання** (CRUD з due date/виконавець/обʼєкт),
      **Коментарі** (потік з автором і таймстампом), **Утилізація** (KPI + розподіл за кодами з
      progress-bars + табл. останніх актів). Усі рядки операційних табів клікабельні → drawer.
      Бек: `DELETE /api/waste/tasks/{id}` додано.
- **Тести:** `wave4b_poc.py` 32/32 ✓, testing_agent **backend 117/118 (99.2%)** + **frontend ~95%** (1 nav bug виправлено).

### ✅ Wave 5A — CRM Integration Layer (ЗАВЕРШЕНО, 2026-06-16)
Підключено legacy CRM-модулі в ECO UI як єдиний робочий простір команди.
Бекенд НЕ змінювався — `CrmAPI` лише обгортає існуючі endpoints у `server.py`.

- [x] **Sidebar reorganized** у дві групи: «ECO • Оператор» (7 пунктів) +
      «CRM • Команда» (6 пунктів).
- [x] **`/app/crm` — CRM-хаб** із 4 module-cards (Tasks/Calls/Invoices/Documents)
      та 4 панелями (overdue / queue / missed / pending docs).
- [x] **`/app/crm/tasks`** — Tasks workspace: 4 KPI, 6 filter tabs (today/tomorrow/
      week/overdue/no_deadline/all), пошук, CRUD з обов'язковим assignee, статус-
      селект (`pending → in_progress → completed`), delete з підтвердженням.
- [x] **`/app/crm/calls`** — Ringostat-калссистема: 4 KPI (Усього/Відповіли/
      Пропущені/Avg), tabs All/Missed, кнопка симулятора дзвінка (admin only) для
      debug/demo, кольорові status-pills (answered/missed/busy/no_answer).
- [x] **`/app/crm/invoices`** — Invoices/Payments: 4 KPI з analytics endpoint,
      4 status tabs (Усі/Очікують/Оплачено/Прострочено), пошук, CRUD (customerId,
      amount, currency, dueDate).
- [x] **`/app/crm/documents`** — Документ-центр: 4 KPI, tabs All/Pending, CRUD
      (name/type/url/customerId/dealId), external-link для https URL.
- [x] **`/app/crm/notifications`** — Уніфікований feed: агрегує overdue tasks +
      overdue invoices + missed calls + pending docs з 4 endpoints; 5 filter tabs,
      source-кольорові іконки, deep-link на відповідний модуль.

- **Endpoints використано:** `/api/tasks/*`, `/api/manager/calls/{my,missed}`,
      `/api/debug/ringostat/simulate`, `/api/invoices/{,/manager/my,/overdue,/analytics,/create}`,
      `/api/documents/{,/queue/pending-verification}`.
- **Тести:** testing_agent_v3 — **backend 142/142 (100%)**, **frontend 100%**, 0 регресій
      від Wave 4A/4B.

### ✅ Wave 6 — Client B2B Cabinet + Google Auth + Site CTA (ЗАВЕРШЕНО, 2026-06-18)
Класична Google-авторизація клієнтів через власний OAuth Client ID (БЕЗ Emergent),
повноцінний B2B-кабінет, прибрано «Кабінет», site-wide inquiry CTA, інбокс звернень.

- [x] **Google Sign-In (GIS popup)** — `GoogleSignIn.js` тягне clientId з `/api/auth/google-client-id`,
      верифікація токена на `/api/customer-auth/google/verify` (google-auth). Client ID
      налаштовується/змінюється в адмінці `/app/settings` (`GET/PATCH /api/admin/settings/auth`,
      app_settings.auth.google.clientId — source of truth, env GOOGLE_CLIENT_ID як fallback).
      allowedDomains (B2B whitelist) + toggle googleEnabled.
- [x] **Client cabinet** (`/client/*`, ізольована сесія `eco_client_token`): Огляд (KPI: всього/
      активні/завершені/сума), Заявки (історія + повтор замовлення/reorder), Деталі заявки
      (stage timeline + позиції + документи), Документи (договори+акти), Профіль (редагування+вихід),
      NewRequestModal (пошук ліцензованих кодів → заявка). Бек: `app/client/router.py`
      (`/api/client/me|summary|requests|requests/{id}|reorder|documents`, scope за email+company_id).
- [x] **Header redesign** (`EcoNav.js`) — прибрано слово «Кабінет»; телефон (click-to-call),
      CTA «Замовити дзвінок», іконка профілю (гість → `/client/login`; авторизований → dropdown
      Кабінет/Заявки/Профіль/Вихід). Адмін лише через прямий `/admin` (з хедера/футера прибрано).
- [x] **Site-wide inquiry CTA** — `InquiryModal` + `InquiryContext` (wired у `PublicLayout`),
      плаваюча FAB-кнопка «Замовити дзвінок» + хедер. Бек `POST /api/public/inquiry`
      → `public_inquiries`.
- [x] **Inquiries inbox (staff)** — `/app/inquiries` + `GET/PATCH /api/waste/inquiries`
      (require_manager_or_admin): фільтри за статусом, пошук, лічильники, зміна статусу
      (new→in_progress→contacted→closed).
- **Тести:** `scripts/poc_client_flow.py` ✓; testing_agent_v3 **backend 17/17 (100%)**,
      **frontend 100%**, 0 багів. Dev-login `ALLOW_DEV_LOGIN=true` (вимкнути в prod).

### 🟡 Wave 5B — File Storage Layer (НАСТУПНИЙ)
- [ ] **Operations Details** — повноцінні картки: Pickup (водій/авто/маршрут/вага/
      дата/коментар), Contract (сума/термін/статус підписання/PDF), Act (факт.вага/
      дата/файл).
- [ ] **Object Center UI** (`/objects/{id}/detail`).
- [ ] **Company360 Full** — додати вкладки Огляд / Завдання / Коментарі / Утилізація
      (розширювати паралельно, НЕ окремою фазою; бек готовий).

### Wave 5 — CRM Integration Layer (підключення готового беку, не написання нового)
- [ ] Tasks · Calls · Invoices · Payments · Documents · Notifications — вивести в
      ECO-навігацію (ендпоінти вже живі: `/api/tasks|calls|invoices|payments|notifications`).

### Wave 6 — Waste Intelligence
- [ ] **NLP Smart Search** (фраза→код, синоніми) замість rule-based.
- [ ] Розширення seed до 200–300 кодів (через імпорт після Directory Admin).

### Wave 7 — Compliance Center (відкладено)
- [ ] Дашборд відповідності B2B: згенеровані відходи, чинні акти, контракти що
      спливають, потрібні ліцензії, ризики. *(Для першого продажу не потрібен.)*

### Відкладено свідомо
- Масове фізичне видалення legacy auto-коду (поки не заважає — знешкоджено blocklists).
- (Опц.) Денормалізація назви компанії у списку заявок (зараз резолвиться на фронті).

> **Комерційна готовність продукту: ~70–75%.** Найбільша бізнес-дірка — Pricing
> Engine + повноцінний операційний облік ваги/транспорту/вартості (Wave 4A→4B).

---

## 5. Ключові ендпоінти (контракти)

**Public (whitelisted):** `GET /api/waste/categories|codes|search`, `GET /api/waste/codes/{slug}`,
`GET /api/waste/license/check`, `POST /api/waste/price`, `POST /api/waste/requests/public`.

**Staff (manager/admin JWT):** `/api/waste/companies|objects|requests|licenses|stats`,
`/api/waste/contracts|pickups|acts (+/{id}/status)`, `/api/waste/requests/{id}/{contract|pickup|act}`,
`/api/waste/companies/{id}/{timeline|tasks|comments}`, `/api/waste/objects/{id}/detail`.

**Auth:** `POST /api/auth/login` → `{access_token}` (Bearer), `GET /api/auth/me`.

> ⚠️ Нові публічні ендпоінти ОБОВ'ЯЗКОВО додавати у whitelist
> `backend/app/middleware/access_gate.py`, інакше 403.

---

## 6. Колекції MongoDB (waste-домен)
`waste_codes`, `waste_companies`, `waste_objects`, `waste_license_matrix`, `waste_requests`,
`waste_contracts`, `waste_pickups`, `utilization_acts`, `waste_activity` (timeline),
`waste_tasks`, `waste_comments`, `waste_counters` (нумерація WC/PU/ACT-YYYY-000001).
Усі ID — UUID-подібні рядкові (`co_…`, `obj_…`, `wr_…`). Datetime — ISO UTC.


---

## 7. Cleanup log — Car-import retirement (2026-06)

Повне видалення логіки **імпорту авто** (спадщина BiBi Cars), CRM-/ECO-ядро збережено.

**Backend (видалено):**
- `legal_workflow.py` (111 КБ, 32 роути) — аукціонний lifecycle (Copart/IAA →
  auction_won → in_transit_to_rotterdam → customs), deposits, contracts2, refund-cron.
- Роути: `/api/leads/{id}/related-cars`, `/api/deal-engine/evaluate` (VIN),
  `/api/seo-clusters/public`, `/api/calculations/*` (Korea/USA→Rotterdam авто-калькулятор).
- Orphan-хелпери: shipment-tracking (`simulate_tracking_progress`, `create_shipment_event`,
  `calculate_shipment_status`, `detect_shipment_issues`, …), VIN shell (`_shell_freshness`,
  `_shell_project`, `_SHELL_*`), `_vehicle_doc_to_public_card`, `_load_related_cars`.

**Backbone збережено (винесено, щоб не зламати фінанси/аудит):**
- `_audit()` + `DEAL_STAGES` → **`app/core/domain_audit.py`** (нейтральний модуль).
- `payments_tracking.py`, `financial_breakdown.py` перепідключені на новий модуль.

**Invariant:** `app/core/architecture_invariants.py` → `_EXPECTED_OPENAPI_PATHS = 686`,
`_EXPECTED_OPENAPI_OPS = 828` (старт чистий, без VIOLATION).

**Frontend (видалено ~14 orphan-файлів):** `Deals.js`(старий), `Deal360`, `Deposits`,
`Contract360`, `CabinetContractSign`, `admin/LegalWorkflowPage`, `admin/DealWorkspacePage`,
`admin/ContractsAccountingPage`, `manager/ManagerOrdersPage`, компоненти
`crm/calculations/*`, `deal360/*`, `orders/*`, `lead360/LeadRelatedCars`,
`crm/DealEngineCard`, `crm/QuoteHistory`, `crm/ManagerPriceOverride`.
**Збережено:** `Customer360`, generic CRM-сторінки, UI-бібліотека (shadcn).

**Залишок (не car-import, generic-фінанси, працюють):** `payments_tracking.py`,
`financial_breakdown.py` — можна ретирувати окремим пасом за потреби.

**Нове (UI):** `components/CountrySelect.jsx` — кастомний country-дропдаун (пошук + прапор +
код, ECO-тема) замість нативного `<select>` у `PhoneField` (модалка «Замовити дзвінок», UA+EN).

**Регрес:** testing_agent ~92% (backend 16/19, frontend 100%). Видалені авто-роути → 404
(seo-clusters/vin → 401 через access-gate, фактично недоступні). CRM/ECO/auth — без регресій.

**Бекап видаленого:** `/tmp/eco_carcleanup_bak/`.



---

## 8. ⚠️ REVERTED — BiBi «wave» modules RESTORED (2026-06)

**Помилкове видалення 11 wave-модулів СКАСОВАНО — усі відновлено.** Це CRM-функціонал
ECO (Calls, Deals, Finance, Operations, Contracts, Executive, Actions, Notifications,
Customer Portal), який треба ЗБЕРЕГТИ й адаптувати під ECO (admin→manager→user, **без
team-lead**) з відповідним фронтом у наявній CRM (`pages/portal/*`).

**Відновлено:** backend `app/wave{2a,6,7,11,12,14,15,16,17,18,19}/` (з бекапу) + усі mounts
у `server.py` + invariant `686/828` (старт OK, усі 11 роутерів змонтовані: 6+7+3+14+8+5+19+5+17+10+12).
Frontend — 22 wave-сторінки + 16 компонентів (`deal360/*`, `lead360/*`) відновлено з git-історії
(commit 251e30a/1ce7287). Team-lead (`TeamLeadDashboard`, `TeamDashboardPage`) — НЕ відновлено (виключено).

**Залишається car-import чистка (апрувнута, НЕ чіпаємо):** legal_workflow(auction), related-cars,
deal-engine(VIN), seo-clusters, calculations(авто-калькулятор), shipment/VIN helpers.

**TODO (за командою користувача):** переписати wave-логіку під ECO + UI у наявній CRM, прибрати team-lead.

---

## 8b. [archived] початковий (помилковий) запис про ретирування

Ретировано **11 дормантних BiBi Cars wave-модулів** — аналітичні надбудови над
доменом deals/finance/contracts/calls, **без живого ECO-фронту** (усі консюмери — orphan):

| Module | Призначення | Endpoints |
|---|---|---|
| wave2a | Calls Foundation | `/api/calls/*` |
| wave6 | Deal Workspace + Timeline | `/api/admin/deals/*` |
| wave7 | Workload Rebalancing | `/api/admin/reassign` |
| wave11 | Deal360 | `/api/deals/{id}/360` |
| wave12 | Finance360 + Forecasting | `/api/finance/*`, `/api/forecast*` |
| wave14 | Operations360 | `/api/operations360/*` |
| wave15 | Contract360 | `/api/contracts/*` |
| wave16 | Executive Center | `/api/executive/*` |
| wave17 | Action Center | `/api/actions/*` |
| wave18 | Notifications + Escalation | `/api/notifications/*` |
| wave19 | Customer Portal View | `/api/customer-portal/*` |

**Backend:** видалено `app/wave{2a,6,7,11,12,14,15,16,17,18,19}/` (~1.36 МБ, ~111 роутів);
демонтовано всі роутери + startup-index блоки в `server.py`; прибрано wave6-hook
(`deal_created` timeline + `pipeline_stage`) з `POST /api/deals`; `reassignment.py`
→ `_maybe_write_deal_timeline` зроблено no-op.

**Invariant:** `_EXPECTED_OPENAPI_PATHS = 586`, `_EXPECTED_OPENAPI_OPS = 719` (старт OK).

**Frontend (видалено 22 orphan + `components/lead360/`):** Finance360, Forecasting360,
Operations360, ExecutiveCenter, ActionCenter, NotificationCenter, NotificationsPage,
CustomerPortalView, Sales, Lead360, AdminRoadmapsPage, TeamLeadDashboard, TeamDashboardPage,
CallBoardPage, AdminPaymentsPage, NotificationSettings, cabinet/ContractsPage, MissedCallsBoard,
NotificationBell, ReassignDialog, hooks useNotifications/useManagersMap.
**Збережено:** `components/calls/*` (живий ECO `crm/calls`), `Customer360`, `Customers`, generic CRM, UI-бібліотека.

**Регрес (testing_agent):** 96.6% (backend 21/22, frontend 7/7), 0 критичних. Усі ретировані
ендпоінти → 404. ECO/CRM/auth — без регресій. (2 minor: `POST /api/deals` 200-vs-201,
`waste/stats` total_codes у одному шляху — обидва pre-existing, косметичні.)

**Бекап:** `/tmp/eco_wave_retire_bak/`.


---
## IBAN bank-transfer + contract-first flow — VERIFIED (audit 2026-06)
Status: COMPLETE & TESTED. Backend POC `python -m scripts.poc_iban_flow` = 24/24.
Testing agent iteration_18: backend 39/39 (100%), frontend CustomerPicker verified.
Flow: admin requisites (UAH primary, USD/EUR optional) → contract signed first
(online e-sign /contract/:token OR manager offline upload) → manager issue-iban
(requisites snapshot + payment_purpose) → client uploads proof (mandatory) + confirms
→ manager pending-confirmation queue → confirm (paid + order executes) / reject.
Stripe intentionally FROZEN (returns 424/503 when not configured; not removed).
Enhancement: manager "New invoice" dialog now uses a searchable CustomerPicker
(GET /api/customers) + requisites-readiness warning per currency.

## Online e-sign branch of IBAN flow — FIXED (2026-06)
Bug: manager "send-online" created a contracts_v2 record but /contract/:token page
only read waste_contracts (404), and the legacy pdf_engine produced a wrong
Bulgarian car-import template. Fix: send-online now builds an ECO Ukrainian
contract directly from the invoice (title/amount/items/company/operator) in
contracts_v2 (no pdf_engine); contracts_v2 public_view payload enriched; public
e-sign page (WasteContractSign) + ContractSignAPI fall back to /api/contracts/view/:token.
Verified: testing_agent iteration_19 backend 13/13 + frontend all flows. Online & offline both green; offline POC still 24/24.

## ECO Ukrainian contract PDF + e-sign polish (2026-06)
- New app/services/eco_contract_pdf.py: renders a Ukrainian «Договір на утилізацію відходів»
  (HTML→WeasyPrint) from the invoice (number/amount/items/company/operator + IBAN from
  per-currency requisites accounts[]). Stored in customer File Manager; file_id attached to
  contracts_v2. Replaces the legacy car-import (BG) template for this flow.
- send-online generates the PDF; public sign regenerates a signed version (stamps name/date/IP).
- Public e-sign page exposes has_pdf + working /api/contracts/view/{token}/download link.
- App.js: added catch-all route ('*' → Navigate '/') so unknown URLs no longer show a blank screen.
- Verified: testing_agent iter20 backend 14/14 + public e-sign 100%; iter21 frontend 2/2
  (/app/settings requisites renders; catch-all redirects). NOTE: admin Settings route is /app/settings (NOT /admin/settings).
