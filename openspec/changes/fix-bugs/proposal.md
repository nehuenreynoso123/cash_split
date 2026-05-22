# Proposal: Fix Known Bugs & Unresolved Issues

## Intent

Fix 7 bugs and 3 unresolved issues blocking cash_split API CRUD. Broken queries (`sq1` typo, missing WHERE), wrong controller dispatch, bad schema (UNIQUE on prices, missing columns), dead imports, stale README, no CORS. These block any feature work.

## Scope

### In Scope
1. `ventas/store.js:34` — `sq1` → `sql`
2. `ventas/store.js:39` — `product_id` → `producto_id`
3. `productos/network.js:21` — call `removeProducto` not `editProducto`
4. `init.sql` — drop UNIQUE on `productos.precio` and `ventas.precio`
5. `productos/store.js` — add WHERE to UPDATE
6. `ventas/store.js` — add WHERE to UPDATE
7. `init.sql` — add `producto_id` and `cantidad` columns to `ventas`
8. `config.js` — remove dead `dotenv` import
9. `README.md` — rewrite for cash_split
10. `server.js` — add `cors` middleware

### Out of Scope
New features, refactoring, test infrastructure, `.env` integration.

## Capabilities

None — no spec-level changes, only implementation correctness restored.

## Approach

Mechanical single-file fixes in dependency order: (1) schema in `init.sql`, (2) startup files (`config.js`, `server.js`), (3) stores (typo, columns, WHERE), (4) network (wrong call), (5) README.

## Affected Areas

| File | Change |
|------|--------|
| `init.sql` | Modify schema |
| `ventas/store.js` | 3 fixes (typo, column, WHERE) |
| `productos/store.js` | Add WHERE |
| `productos/network.js` | Fix method call |
| `config.js` | Remove import |
| `server.js` | Add cors middleware |
| `README.md` | Rewrite |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| No tests — regressions invisible | High | Manual verification per success criteria |
| Schema change + existing DB volume | Low | `docker compose down -v` |
| CORS blocking frontend | Low | Default `cors()` allows all origins |

## Rollback Plan

Each fix is a single-file revert except `init.sql` (requires volume reset). Non-schema fixes: revert file, restart dev server.

## Dependencies

- `npm install cors` (not in deps)
- `docker compose down -v` for schema changes

## Success Criteria

- [ ] `npm run api:dev` starts clean
- [ ] `removeProducto` deletes product (was calling wrong method)
- [ ] `ventas` INSERT/UPDATE succeed (was crashing on `sq1`/wrong column)
- [ ] `productos` and `ventas` UPDATE only affect targeted rows
- [ ] Multiple products/ventas can share same price
- [ ] README describes cash_split, not inversiones-note
- [ ] CORS headers present on API responses
