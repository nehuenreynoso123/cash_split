# Tasks: Fix Known Bugs & Unresolved Issues

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~90–100 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-always |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | All 10 fixes | PR 1 | Single PR, under 100 changed lines |

## Phase 1: Schema & Infrastructure

- [x] 1.1 `init.sql` — Remove `UNIQUE` from `productos.precio` (line 44) and `ventas.precio` (line 53)
- [x] 1.2 `init.sql` — Add `producto_id INTEGER REFERENCES productos(id)` and `cantidad INTEGER DEFAULT 1` columns to `ventas` table
- [x] 1.3 `package.json` — Add `cors` to dependencies
- [x] 1.4 `config.js` — Remove dead `import { config } from "dotenv"` and `config()` call

## Phase 2: Store Layer Fixes

- [x] 2.1 `ventas/store.js:34` — Fix typo `sq1` → `sql`
- [x] 2.2 `ventas/store.js:39` — Fix column `product_id` → `producto_id` in UPDATE SET clause
- [x] 2.3 `ventas/store.js:38-40` — Add `WHERE id = ${id}` to the UPDATE query
- [x] 2.4 `ventas/controller.js:8-10` — Thread `id` through `editVenta`: destructure `id` from body, pass to `update()`
- [x] 2.5 `productos/store.js:12-13` — Add `WHERE id = ${id}` to the UPDATE query
- [x] 2.6 `productos/controller.js:8-10` — Thread `id` through `editProducto`: destructure `id` from body, pass to `edit()`

## Phase 3: Network & Server Wiring

- [x] 3.1 `productos/network.js:21-23` — Fix `removeProducto` handler: call `controller.removeProducto()` instead of `editProducto()`; optionally fix status to 200
- [x] 3.2 `api_cash_split/server.js` — Add `import cors from "cors"` and `app.use(cors())` middleware

## Phase 4: Documentation

- [x] 4.1 `README.md` — Rewrite to describe cash_split project structure, replacing all inversiones-note references

## Verification

- [ ] 5.1 `npm run api:dev` starts without errors (no import/module resolution failures)
- [ ] 5.2 Manual: DELETE to `/api/producto` actually deletes (was calling edit)
- [ ] 5.3 Manual: ventas INSERT and UPDATE succeed without crash
- [ ] 5.4 Manual: productos and ventas UPDATE only affect one row (not all)
- [ ] 5.5 Manual: multiple products or ventas can share the same price
- [ ] 5.6 Manual: API responses include `Access-Control-Allow-Origin` header
