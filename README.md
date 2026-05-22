# Cash Split

API de gestión de caja con separación inteligente del flujo de dinero para pequeños negocios.

## Concepto

El sistema divide automáticamente el ingreso de cada venta en dos destinos:

- **Caja de Reposición**: reserva para reponer el stock vendido (basado en el costo del producto)
- **Caja de Inversión**: refleja el valor del inventario físico restante

Esto asegura que el negocio nunca se descapitaliza al gastar dinero que debería reservarse para reposición.

## Stack

- **Runtime**: Node.js con Express 5 (ESM)
- **Base de datos**: PostgreSQL 16
- **Dev server**: `tsx watch` (recarga automática)
- **Autenticación**: JWT + bcryptjs

## Estructura del proyecto

```
cash_split/
├── api_cash_split/
│   ├── components/
│   │   ├── auth/           # Registro e inicio de sesión
│   │   ├── productos/      # CRUD de productos (stock + precio)
│   │   ├── ventas/         # Registro de ventas con split automático
│   │   ├── gastos/         # Gastos operativos
│   │   ├── deudores/       # Deudores registrados
│   │   ├── caja_inversion/          # Caja de inversión (stock)
│   │   ├── caja_reposicion_stock/   # Caja de reposición
│   │   └── dashboard/      # Resumen de todas las cajas
│   ├── middleware/          # Verificación JWT
│   ├── network/            # Rutas centrales y formato de respuesta
│   └── server.js           # Punto de entrada
├── store/
│   └── database.js         # Conexión a PostgreSQL
├── init.sql                # Esquema de base de datos
├── config.js               # Configuración de entorno
├── docker-compose.yml      # Docker Compose (API + DB)
└── package.json
```

## Inicio rápido

```bash
# Iniciar servicios con Docker
docker compose up -d

# Iniciar API en modo desarrollo
npm run api:dev
```

La API corre en `http://localhost:3000`. Todos los endpoints están bajo `/api` y requieren autenticación JWT excepto `/api/auth/signup` y `/api/auth/signin`.

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | No | Registrar usuario |
| POST | `/api/auth/signin` | No | Iniciar sesión |
| GET | `/api/producto` | JWT | Listar productos |
| POST | `/api/producto` | JWT | Crear producto |
| PUT | `/api/producto` | JWT | Actualizar producto |
| DELETE | `/api/producto` | JWT | Eliminar producto |
| GET | `/api/venta` | JWT | Listar ventas |
| POST | `/api/venta` | JWT | Crear venta |
| PUT | `/api/venta` | JWT | Actualizar venta |
| DELETE | `/api/venta/:id` | JWT | Eliminar venta |
| GET | `/api/gasto` | JWT | Listar gastos |
| POST | `/api/gasto` | JWT | Crear gasto |
| GET | `/api/deudor` | JWT | Listar deudores |
| POST | `/api/deudor` | JWT | Crear deudor |
| PUT | `/api/deudor` | JWT | Actualizar deudor |
| DELETE | `/api/deudor/:id` | JWT | Eliminar deudor |
| GET | `/api/total-cajas` | JWT | Resumen de todas las cajas |
