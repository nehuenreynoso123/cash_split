# cash_split — Agent guidance

## Quick start

```bash
npm run api:dev    # dev server with tsx watch on port 3000
```

No tests configured. Docker Compose runs API + PostgreSQL 16.

## Project structure

- Entrypoint: `api_cash_split/server.js` (Express ESM, hardcoded port 3000)
- DB connection: `store/database.js` — uses `postgres` library, hardcoded Docker credentials (`host: "db"`, `user`, `password`, `cash_db`)
- Routes: `api_cash_split/routes.js` — all components registered under `/api`
- Components live in `api_cash_split/components/<domain>/` with 3 files each:
  - `network.js` — Express router, 4 standard CRUD endpoints
  - `controller.js` — orchestrates store calls
  - `store.js` — raw SQL via `postgres` tagged templates

## Known bugs (do not introduce new ones without fixing these)

- `ventas/store.js:34` — `sq1` typo (should be `sql`)
- `ventas/store.js:39` — `product_id` column does not exist; should be `producto_id`
- `productos/network.js:21` — `removeProducto` calls `controller.editProducto` instead of `removeProducto`
- `init.sql` — `UNIQUE` on `productos.precio` and `ventas.precio` is almost certainly wrong

## Unresolved issues

- `config.js` imports `dotenv` but it is not in `package.json` dependencies; no `.env` file exists
- README is stale — describes a different project (`inversiones-note` layout, not `cash_split`)
- CORS not configured

## Architecture notes

- DB tables: `usuarios`, `gastos`, `deudores`, `caja_inversion`, `caja_reposicion_stock`, `productos`, `ventas` (see `init.sql`)
- Business logic: on sale, `precio` is added to `caja_reposicion_stock` and subtracted from `caja_inversion`; dashboard calculates profit via aggregate query
- Response shape: `{ error: bool, status: int, body: ... }` (see `network/response.js`)
- Error middleware at `network/error.js`
- `.gitignore` excludes `postgres_Data/` (Docker volume data)
