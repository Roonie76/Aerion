# Cowork Memory

## 2026-04-21 — H11 Analytics (GA4) completion

### Completed
- **H11 Analytics** — all remaining funnel events wired.
  - `add_payment_info` in `src/pages/Cart.jsx` before `initiatePayment()`.
  - `login` event in `src/pages/Login.jsx` on both email and Google sign-in success.
  - `sign_up` event in `src/pages/Register.jsx` on both email and Google registration success.
  - Added `VITE_GA_MEASUREMENT_ID=""` to `.env.example`.
  - Added enable-flag bootstrap in `src/index.jsx`: `window.__AERION_GA_ENABLED__ = import.meta.env.PROD` (only when `VITE_GA_MEASUREMENT_ID` is set).
- Build verified: `npx vite build` passes (3.93s, 629.88 kB bundle / 199.93 kB gzip).

### Already in place (from prior session)
- `src/lib/analytics.js` — GA4 loader, `trackPageView`, `trackEvent`, `toGA4Item`, opt-out helpers (`setAnalyticsOptOut`, `isAnalyticsOptedOut`) with `ga-disable-<ID>` flag sync.
- `App.jsx` — `initAnalytics()` on mount + `trackPageView()` on `location.pathname` change.
- `Series.jsx` — `view_item_list` on mount.
- `ProductDetail.jsx` — `view_item` on product load.
- `CartContext.jsx` — `add_to_cart` / `remove_from_cart`.
- `Cart.jsx` — `begin_checkout`, `add_shipping_info`, `purchase`.

### Full backlog status
| Item | Status |
|---|---|
| H3 SEO | ✅ done |
| H4 Email | ✅ done |
| H6 Error boundaries + skeletons | ✅ done |
| H7 Form validation | ✅ done (verified via grep: `src/utils/validation.js` + schemas in Login/Register/Cart/Contact) |
| H8 Image optimization | ✅ done (verified via grep: `src/components/Picture.jsx` present, `<picture>` wiring in ProductCard/PDP/Home/About) |
| H9 Accessibility | ✅ done (verified via grep: skip-link, `role="status"` live regions, `prefers-reduced-motion` handling in App.jsx/Hero/PageTransition/CustomCursor) |
| H11 Analytics | ✅ done (this session) |

### Open questions / blockers
- None. GA4 is gated behind `VITE_GA_MEASUREMENT_ID` + `PROD` mode, so dev builds make zero analytics calls.
- Bundle is 629.88 kB (> 500 kB warning). Not a blocker; flagged for future code-splitting pass if needed.

### Next recommended step
All seven H-series items are shipped. If any regression surfaces, the most likely suspect areas are:
1. GA4 events in production — verify in GA4 DebugView that `page_view → view_item → add_to_cart → begin_checkout → add_shipping_info → add_payment_info → purchase` fires in order on a real checkout.
2. Bundle splitting to drop below the 500 kB warning (route-level `React.lazy()` on Cart/ProductDetail/Account would be the biggest wins).

## 2026-04-22 — Returns/Cancel workflow, Phases 1 & 3

### Completed
- **Phase 1 (DB)** — idempotent migration at `server/sql/migrations/001_order_requests.sql`. Adapted spec's SERIAL/INT to project's UUID + TIMESTAMPTZ conventions. Creates `req_type`/`req_status` enums + `order_requests` table + indexes. Must still be run: `psql "$DATABASE_URL" -f server/sql/migrations/001_order_requests.sql`.
- **Phase 3 (backend module)** — `server/src/modules/returns/` with `returns.llm.js` (stub), `returns.repository.js`, `returns.service.js`, `returns.controller.js`, `returns.routes.js`. Wired into `server/src/app/routes.js` at `/api/returns`. All pass `node --check`.
- Endpoints: `POST /api/returns/request` (protected), `GET /api/returns/admin?status=…` (protected + admin).

### Divergences from user's spec (intentional adaptations)
- Project is ESM (`"type":"module"`) — all files use `import`/`export`, not `require`/`module.exports`.
- Pool import: `../../shared/db/index.js` named `{ pool }`, not `../../config/db`.
- Auth middleware: `{ protect, adminOnly }` from `../../middleware/authMiddleware.js` (local JWT cookies — NOT Firebase as spec implied). Frontend must send `credentials: 'include'`, not bearer tokens.
- Email: `../../shared/integrations/emailService.js`, not `../../services/email.service`.
- **`orders.order_status` does not exist** — schema column is `orders.status`. Repo uses `status` + aliases it as `order_status` in the admin list SELECT to keep the response shape spec-compatible.
- `delivered_at` is NOT a column on `orders` — derived via subquery from `order_status_history` (latest row where `to_status='delivered'`).
- `updateOrderStatus()` also inserts into `order_status_history` to match project pattern.
- Added `checkPendingRequest()` (service calls it; spec omitted the repo definition).
- Service throws errors with `statusCode` so the project's `errorHandler` maps them correctly.

### Open questions / blockers
- **Phase 2 LLM (Ollama) not yet written.** `returns.llm.js` is a stub that always returns `INFO_NEEDED`. Full Ollama-backed `decide()` from user's Phase 2 message is pending — needs ESM conversion and should stay at `server/src/modules/returns/returns.llm.js` (not in a top-level `services/` dir, which doesn't exist).
- **Phase 4 frontend (`OrderRequestForm.jsx`) not yet written.** Frontend auth uses cookie sessions (`credentials: 'include'`), not `Authorization: Bearer`. Spec's `getFirebaseToken()` call is wrong for this repo.
- **Phase 5 (Cowork automation)** is runtime ops, not code — no files to write.
- Migration has not been run against the user's DB yet. Backend will 500 on any `/api/returns/*` call until it is.

### Next recommended step
1. Run the migration: `psql "$DATABASE_URL" -f server/sql/migrations/001_order_requests.sql`.
2. Phase 2: port the Ollama `decide()` from the user's spec into `returns.llm.js` (ESM, use `order.status`/derived `delivered_at` instead of `order.order_status`/`order.delivered_at`).
3. Phase 4: frontend form — use `fetch('/api/returns/request', { credentials: 'include', ... })`, no bearer token.
