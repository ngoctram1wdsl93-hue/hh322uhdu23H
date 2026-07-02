# IBAN (Bank Transfer) Payments + Contract Signing — Delivery Plan (ECO.NOVA)

## 1) Objectives
- Ship a complete **contract-first → IBAN invoice → client proof → manager confirmation → order execution** flow.
- Keep **Stripe frozen**: keep code, but make IBAN the only usable payment path in client-facing UX.
- Support **admin-configurable requisites per currency** (UAH primary; USD/EUR optional) with invoice-time snapshotting.
- Support **online e-sign** (contracts_v2) and **offline signing** (manager uploads signed file + marks signed).
- Ensure **proof file is mandatory** for client payment confirmation.

**Current status:** Objectives are **completed and verified** (backend + UI + E2E).

## 2) Implementation Steps

### Phase 1 — Core Flow POC (backend-first, isolate the risky workflow)
**Goal:** Prove end-to-end state machine works in isolation before UI work.

User stories:
1. As an admin, I can set requisites for UAH (and optionally USD/EUR) so invoices can be issued.
2. As a manager, I cannot issue an IBAN invoice unless a linked contract is **signed**.
3. As a client, I can upload a payment proof file and mark an invoice as paid (claim).
4. As a manager, I can review a payment claim and confirm it to trigger order execution.
5. As a manager, I can reject a claim and return the invoice to “sent”.

Backend changes (minimal but complete):
- ✅ **Requisites model upgrade**
  - `billing_settings` supports: legal entity fields + `accounts[]` per currency (UAH/USD/EUR).
  - `GET/PUT /api/admin/billing/requisites` + `GET /api/billing/requisites` return new shape.
  - Backwards compatible: legacy single-IBAN config migrates-on-read.
  - `issue-iban` snapshots the **currency-specific account** and payment purpose into the invoice.
- ✅ **Contract gating for issuing IBAN invoice**
  - `POST /api/invoices/{id}/issue-iban` requires `contracts_v2` linked to invoice and `lifecycle == signed`.
- ✅ **Offline contract signing (manager)**
  - `POST /api/manager/invoices/{id}/contract/offline-sign` uploads file + marks/creates `contracts_v2` as `signed`.
- ✅ **Online contract send (manager)**
  - `POST /api/manager/invoices/{id}/contract/send-online` generates/ensures a contract and marks it `sent` (public view token).
- ✅ **Payment claim hard requirement**
  - `POST /api/client/invoices/{id}/confirm-payment` requires non-empty `proof_url`.
- ✅ **Payment confirmation executes the order**
  - `POST /api/invoices/{id}/confirm-payment` marks invoice paid and calls `create_order_from_invoice` (idempotent).
- ✅ **Reject flow**
  - `POST /api/invoices/{id}/reject-payment` returns invoice to `sent` and records reason.
- ✅ **Defaults / robustness**
  - Manager-created invoice default currency is **UAH**.
  - `manager_create_invoice` resolves customer and stamps `customerEmail/company_id` so client portal visibility is reliable.
  - Timeline kinds updated to include `iban_issued`.

POC script:
- ✅ `/app/backend/scripts/poc_iban_flow.py`
  - Full end-to-end IBAN flow covering: requisites → create invoice → contract sign (offline) → issue-iban → client upload proof + confirm → manager confirm → order created.
  - **Result: 24/24 checks passed (GREEN).**

**Phase 1 status:** ✅ Completed and validated.

---

### Phase 2 — V1 App Development (UI wiring around proven core)
**Goal:** Implement UX in Admin CRM, Manager CRM, and Client portal.

User stories:
1. As an admin, I can configure requisites per currency and preview how they appear on invoices.
2. As a manager, I can see contract status for an invoice and complete online/offline signing.
3. As a manager, I can issue an IBAN invoice only after contract is signed.
4. As a client, I can view IBAN requisites, copy details, upload proof, and confirm payment.
5. As a manager, I can review a queue of payment claims with proof preview and confirm/reject.

Frontend work:
- ✅ **Admin Settings → “Реквізити для оплати (IBAN)”** (`/app/settings`)
  - Implemented `components/admin/BillingRequisites.jsx`.
  - Mounted on the **correct** CRM settings page: `pages/portal/Settings.js` (route `/app/settings`).
  - Supports legal entity fields + per-currency accounts; toggles + validation.
  - Verified visually: save toast “Реквізити збережено” + persistence.
- ✅ **Manager invoices** (`/app/crm/invoices`)
  - Rewrote `pages/portal/CrmInvoices.js`:
    - 3-step ManageDrawer: Contract (online/offline) → Issue IBAN (gated) → Confirm/Reject payment.
    - Proof preview link in Step 3.
    - Create-invoice dialog (UAH default).
- ✅ **Client portal (/client) — “Рахунки / Оплата”**
  - Added route + nav: `/client/invoices`.
  - Implemented `pages/client/ClientInvoices.js`:
    - Invoice list, status badges, requisites snapshot with copy buttons.
    - Mandatory proof upload + confirm payment.
    - Displays “Under review/На перевірці”, “Paid/Сплачено”, rejection reason.
  - Styling added to `pages/client/client.css` (ci-* classes).
- ✅ **Freeze Stripe UX**
  - Stripe flows remain in code, but client-facing portal uses IBAN only.
  - Legacy Stripe cabinet invoices page is **unrouted**.

End of Phase 2: testing
- ✅ E2E via `testing_agent_v3`:
  - Backend 100% endpoints functional
  - Manager UI 100% flow
  - Client UI 100% flow
  - Admin UI initially flagged due to wrong (dead) Settings file; fixed by mounting requisites UI into `pages/portal/Settings.js`.

**Phase 2 status:** ✅ Completed and verified.

---

### Phase 3 — Hardening + UX polish (production-friendly)
**Goal:** Optional improvements after V1 completion.

User stories:
1. As a manager, I can filter payment claims by customer/invoice/date and quickly act.
2. As a client, I can see clear instructions (steps) and warnings about bank transfer timing.
3. As an admin, I can disable a currency account without breaking historical invoices.
4. As a manager, I can download the invoice PDF and attach it to messages.
5. As an operator, I can audit the full timeline: contract signed → invoice issued → claim → confirmed.

Hardening tasks (future / optional):
- Add stronger i18n coverage for new strings (UK primary) and consistent status naming across CRM + client portal.
- Extend timeline/audit events:
  - `payment_claimed`, `payment_confirmed`, `payment_rejected` (beyond `iban_issued`).
- Improve Manager create-invoice UX:
  - multi-line item builder, customer picker, better validation.
- PDF improvements:
  - ensure invoice PDF includes requisites snapshot + payment purpose.
- Contract UX polish:
  - show/view online e-sign link more prominently, surface contract PDF preview.
- Payment enhancements (only if needed):
  - partial payments, multiple proofs, or reconciliation notes.

**Phase 3 status:** ⏳ Not required for V1; available as next iteration.

## 3) Next Actions
**V1 delivered.** If continuing:
1. Decide which Phase 3 hardening items are required for production.
2. Add a regression test suite for IBAN flow (API-level) + UI smoke tests.
3. Polish manager/customer experience (filters, messaging attachments, PDF templates).

## 4) Success Criteria
- ✅ Admin can configure requisites per currency; invoices snapshot correct requisites.
- ✅ Manager cannot issue IBAN invoice unless contract is signed (online or offline).
- ✅ Client must upload proof before confirming payment.
- ✅ Manager sees pending-confirmation queue; confirm sets invoice `paid` and **creates order** (idempotent) via `create_order_from_invoice`.
- ✅ Stripe checkout is not accessible from client UI; IBAN flow is the only usable path.
- ✅ No regressions in core CRM; verified with E2E testing agent + manual spot checks.
