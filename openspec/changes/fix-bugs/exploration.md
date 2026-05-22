## Exploration: fix-bugs

### Current State

The codebase has 4 known bugs documented in `AGENTS.md` and 3 unresolved issues. These affect the `ventas`, `productos`, and `init.sql` files. Additionally, 2 serious secondary bugs were discovered during exploration (no WHERE clause on UPDATE queries).

The project follows a 3-file component pattern (network/controller/store) per domain with raw SQL via `postgres` tagged templates, Express 5, and JWT auth. No test infrastructure exists.

---

### Bug-by-Bug Analysis

#### Bug 1: `ventas/store.js:34` — `sq1` typo (should be `sql`)

- **File**: `api_cash_split/components/ventas/store.js`
- **Code**: `const [list] = await sq1\`SELECT * FROM ventas\`;`
- **Root cause**: `sq1` (el-one) instead of `sql` (ell). The `sql` variable is imported from `store/database.js` at line 1.
- **Impact**: Runtime `ReferenceError: sq1 is not defined` — the `list()` export is completely broken. Anyone calling GET /venta gets a 500 error.
- **Fix**: Replace `sq1` with `sql` on line 34.
- **Ripple risk**: **None** — isolated single-character typo in a variable reference. Cannot affect other functionality.

#### Bug 2: `ventas/store.js:39` — `product_id` column does not exist

- **File**: `api_cash_split/components/ventas/store.js`
- **Code (line 38-40)**: 
  ```js
  export async function update({ nombre, precio, product_id }) {
    await sql\`UPDATE ventas SET nombre=${nombre}, precio=${precio},product_id=${product_id}\`;
  }
  ```
- **Root cause**: The UPDATE SET clause references `product_id` as a column name, but the column is named `producto_id` (consistent with how the INSERT at line 8 references it).
- **Also**: The `ventas` table in `init.sql` does NOT define ANY foreign key column. Line 8's INSERT references `producto_id` but the schema has no such column. So both INSERT and UPDATE fail.
- **Impact**: Both `add()` and `update()` on ventas are broken due to missing schema column. Runtime PostgreSQL error: `column "producto_id" of relation "ventas" does not exist`.
- **Fix (2 parts)**: (a) Add `producto_id INTEGER REFERENCES productos(id)` to the `ventas` table in `init.sql`. (b) Change `product_id` to `producto_id` on line 39's SET clause.
- **Ripple risk**: **Low** — Adding a column is additive and non-breaking for existing queries. The column reference fix in UPDATE is isolated. However, `init.sql` is used by Docker Compose to seed a fresh DB; applying this to an existing database requires a migration (`ALTER TABLE`), not re-running `init.sql`. This is a concern for production data, not dev.
- **Additional schema gap**: The `ventas` table also lacks a `cantidad` column, but line 8's INSERT references it. The column `precio` is the sale total and `cantidad` should likely default to 1.

#### Bug 3: `productos/network.js:21` — `removeProducto` calls `controller.editProducto`

- **File**: `api_cash_split/components/productos/network.js`
- **Code (line 20-25)**:
  ```js
  function removeProducto(req, resp, next) {
    controller
      .editProducto(req.params.id)
      .then((data) => response.success(req, resp, data, 201))
      .catch(next);
  }
  ```
- **Root cause**: Copy-paste error — the handler calls `editProducto` instead of `removeProducto`. Also uses 201 (Created) status instead of 200 (OK) for a delete operation, but the latter is cosmetic.
- **Impact**: DELETE requests to `/api/producto` silently edit a product instead of deleting it. The caller thinks the product was removed but it wasn't. Non-obvious data corruption.
- **Fix**: Replace `controller.editProducto(req.params.id)` with `controller.removeProducto(req.params.id)`. Optionally fix status code to 200.
- **Ripple risk**: **None** — isolated handler-level mistake. `controller.removeProducto(id)` exists and works correctly (calls `store.remove({ id })`).

#### Bug 4: `init.sql` — UNIQUE constraint on `productos.precio` and `ventas.precio`

- **Files**: `init.sql` lines 44, 53
- **Code**:
  ```sql
  precio DECIMAL(10,2) UNIQUE NOT NULL,  -- productos line 44
  precio DECIMAL(10,2) UNIQUE NOT NULL,  -- ventas line 53
  ```
- **Practical impact**: **HIGH**. This is NOT a latent issue — it actively breaks real use cases:
  - Two different products with the same price (e.g., two products at $10.00) → second INSERT fails with duplicate key violation.
  - Two sales/ventas with the same amount → second INSERT fails.
  - This severely limits the business: you can only sell one product per unique price tier, and only register one sale per unique amount.
- **Why it's wrong**: `UNIQUE` on a financial amount field makes no business sense. Prices are naturally repeatable — multiple products share prices, multiple sales share amounts.
- **Fix**: Remove `UNIQUE` from both `precio` columns in the `productos` and `ventas` table definitions.
- **Ripple risk**: **Low** — Removing UNIQUE on a column that previously enforced it requires dropping the constraint. On a fresh DB (Docker init), just removing `UNIQUE` from CREATE TABLE is fine. On an existing DB, it needs `ALTER TABLE productos DROP CONSTRAINT productos_precio_key;` (and same for ventas). No app code references this constraint.

---

### Secondary Critical Bugs Discovered

#### Bug 5: `productos/store.js:13` — UPDATE without WHERE clause

- **Code**: `await sql\`UPDATE productos SET (nombre=${nombre},precio=${precio},stock=${stock})\`;`
- **Impact**: Calling `editProducto()` updates EVERY row in the `productos` table to the same values. This corrupts all product data. This is arguably the most destructive bug in the codebase.
- **Fix**: Add `WHERE id = ${id}` — but `id` is not currently passed through the `edit({ nombre, precio, stock })` function signature. The controller at line 8-10 destructures only `{ nombre, precio, stock }` from `body`. Need to also pass `id`.

#### Bug 6: `ventas/store.js:38-40` — UPDATE without WHERE clause

- **Code**: `await sql\`UPDATE ventas SET nombre=${nombre}, precio=${precio},product_id=${product_id}\`;`
- **Impact**: Same as Bug 5 — updates ALL ventas rows.
- **Fix**: Add `WHERE id = ${id}` — but `id` is not passed through. The controller at line 8-10 destructures `{ nombre, precio, product_id }` — also needs `id`.

---

### Unresolved Issues Assessment

#### Issue A: `config.js` imports `dotenv` (not in dependencies)

- **File**: `config.js` (project root)
- **Code**: `import { config } from "dotenv";`
- **Impact**: **Minimal currently** — `config.js` is NOT imported anywhere in the running application. `server.js` does not import it. However, if someone tries to use it, the app crashes with `ERR_MODULE_NOT_FOUND` because `dotenv` is absent.
- **Fix options**: (a) Add `dotenv` to `package.json` dependencies. (b) Remove the import and use `process.env` directly (already works in Node 22 without dotenv). (c) Delete `config.js` as dead code.
- **Risk**: Low.

#### Issue B: README is stale

- **File**: `README.md`
- **Describes**: `inversiones-note` project structure (old name), references `/components/` instead of `api_cash_split/components/`, references `/db/index.js` instead of `store/database.js`
- **Impact**: Misleading for new developers onboarding. Low operational impact.
- **Fix**: Rewrite README to match `cash_split` actual structure.
- **Risk**: None — documentation only.

#### Issue C: CORS not configured

- **Observation**: `server.js` has no CORS middleware. `package.json` has no `cors` dependency. No `Access-Control-Allow-Origin` headers are set.
- **Impact**: Browser-based frontends from different origins (e.g., React dev server on port 5173) cannot call the API. Mobile clients, Postman, server-to-server calls work fine.
- **Fix**: Add `cors` to dependencies, import and `app.use(cors())` in `server.js`.
- **Risk**: Low — additive middleware, no breaking changes if configured permissively.

---

### Affected Areas

| File | Bug/Issue | Change Required |
|------|-----------|-----------------|
| `api_cash_split/components/ventas/store.js:34` | Bug 1 — `sq1` typo | Change `sq1` → `sql` |
| `api_cash_split/components/ventas/store.js:39` | Bug 2 — wrong column name | Change `product_id` → `producto_id` in SET clause |
| `api_cash_split/components/ventas/store.js:38-40` | Bug 6 — missing WHERE | Add `WHERE id = ${id}`, thread `id` through controller |
| `api_cash_split/components/ventas/controller.js:8-10` | Bug 6 — missing `id` param | Destructure `id` from body |
| `api_cash_split/components/productos/network.js:21-22` | Bug 3 — wrong controller call | Change to `controller.removeProducto()`, fix status |
| `api_cash_split/components/productos/store.js:13` | Bug 5 — missing WHERE | Add `WHERE id = ${id}`, thread `id` through controller |
| `api_cash_split/components/productos/controller.js:8-10` | Bug 5 — missing `id` param | Destructure `id` from body |
| `init.sql:44,53` | Bug 4 — UNIQUE on precio | Remove `UNIQUE` from both `precio` columns |
| `init.sql:50-55` | Bug 2 (schema) — missing column | Add `producto_id INTEGER REFERENCES productos(id)` to `ventas` |
| `init.sql:50-55` | Bug 2 (schema) — missing column | Add `cantidad INTEGER DEFAULT 1` to `ventas` (referenced in INSERT) |
| `config.js` | Issue A — dead code / missing dotnet | Remove or fix |
| `package.json` | Issue A — missing `dotenv` dep | Add if keeping `config.js` |
| `README.md` | Issue B — stale docs | Rewrite to match current project |
| `api_cash_split/server.js` | Issue C — no CORS | Add `cors` middleware |
| `package.json` | Issue C — missing `cors` dep | Add `cors` dependency |

---

### Approaches

1. **Fix only the 4 known bugs + schema gaps** — Minimal scope, lowest risk.
   - Pros: Quick, focused, each fix is isolated and safe
   - Cons: Leaves secondary bugs (missing WHERE) and unresolved issues untouched — `editProducto()` and `editVenta()` still corrupt data
   - Effort: Low

2. **Fix all discovered bugs (1-6) + schema** — Addresses the missing WHERE clauses found during exploration.
   - Pros: All runtime-breaking bugs fixed, no silent data corruption remaining
   - Cons: Slightly more files touched, but still isolated per-component
   - Effort: Low

3. **Fix all bugs + unresolved issues** — Full sweep including config.js, README, CORS.
   - Pros: Comprehensive, leaves the project in genuinely good shape
   - Cons: Broader scope, mixing concerns (bugs vs docs vs infra config)
   - Effort: Medium

---

### Recommendation

**Approach 2**: Fix all discovered bugs (1-6) plus the schema gaps. Rationale:

- Bugs 1-4 are known and clearly documented.
- Bugs 5-6 (missing WHERE clauses) are discovered during exploration and are **more destructive** than the known bugs — they cause silent data corruption across all products/ventas on every edit.
- All fixes are isolated, low-risk, and follow the same pattern (typo fix, column rename, method reference fix, constraint removal, adding WHERE clauses).
- The schema gaps (`producto_id` and `cantidad` columns missing from `ventas` table) are blockers for both INSERT and UPDATE — they MUST be fixed for ventas to work at all.
- The unresolved issues (config.js, README, CORS) are real but are infrastructure/quality-of-life concerns, not bugs. They can be a separate change.

**Important constraint**: The schema changes in `init.sql` only apply to fresh Docker-initialized databases. For an existing database, corresponding `ALTER TABLE` migrations are needed. This should be called out in the proposal and/or design.

---

### Risks

1. **Missing WHERE on UPDATE queries** (Bugs 5-6): If these are NOT fixed alongside the known bugs, `editProducto()` and `editVenta()` remain active data corruption paths. They are NOT listed in AGENTS.md so the orchestrator might miss them. **Critical to include.**

2. **Schema gap on `ventas` table**: The `producto_id` column is referenced by INSERT (line 8) and UPDATE (after fix, line 39) but missing from `init.sql`. Without adding it, the ventas component remains non-functional. Must be fixed together with Bug 2.

3. **Existing database migration**: The `init.sql` changes (remove UNIQUE on precio, add `producto_id` column) only apply to fresh databases created via Docker Compose's init. If there's a production or staging database with real data, separate `ALTER TABLE` migrations are required. This should be documented.

4. **`update` function naming inconsistency**: The ventas store exports `update()` but the controller calls `editVenta()` → `update()`. The productos store exports `edit()` and the controller calls `editProducto()` → `edit()`. This is inconsistent but not a bug — different naming conventions exist across components. Fixing this is scope creep.

5. **No test coverage**: Zero tests exist. The only verification possible is manual `curl` or Postman testing. Any fix introduces risk of undetected regression.

---

### Ready for Proposal

**Yes** — the bugs are well-understood, the fixes are straightforward, and the ripple effects are minimal. The proposal should:

1. List all 6 bugs + schema gaps with exact file locations
2. Choose Approach 2 (all discovered bugs)
3. Call out the existing-database migration constraint
4. Recommend deferred handling of unresolved issues (config.js, README, CORS) as a separate change

---

### Fix Summary for Each Bug

| # | File | Line(s) | Current Code | Fix | Risk |
|---|------|---------|-------------|-----|------|
| 1 | `ventas/store.js` | 34 | `sq1\`...\`` | `sql\`...\`` | None |
| 2 | `ventas/store.js` | 39 | `product_id=${product_id}` | `producto_id=${product_id}` | Low |
| 2s | `init.sql` | ventas table | missing `producto_id`, `cantidad` | Add both columns | Low |
| 3 | `productos/network.js` | 21-22 | `controller.editProducto(req.params.id)` | `controller.removeProducto(req.params.id)` | None |
| 4 | `init.sql` | 44, 53 | `UNIQUE` on `precio` | Remove `UNIQUE` | Low |
| 5 | `productos/store.js` | 13 | `UPDATE productos SET ...` | Add `WHERE id = ${id}` | Low |
| 5c | `productos/controller.js` | 8-10 | `{ nombre, precio, stock }` | Add `id` to destructure | Low |
| 6 | `ventas/store.js` | 38-40 | `UPDATE ventas SET ...` | Add `WHERE id = ${id}` | Low |
| 6c | `ventas/controller.js` | 8-10 | `{ nombre, precio, product_id }` | Add `id` to destructure | Low |
