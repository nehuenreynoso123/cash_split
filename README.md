## 🧠 Lógica de Negocio: El Sistema de Cajas (Cash Splice)

El núcleo de esta aplicación es la separación inteligente del flujo de caja. En lugar de tratar el ingreso como una masa única, el sistema automatiza la división del dinero para garantizar la sostenibilidad del negocio.

### 1. Definición de Cajas (Patrimonio)

El sistema gestiona tres estados financieros fundamentales:

* **Total Invertido (Stock):** Representa el valor monetario de la mercadería física. No es liquidez, sino activos. Su valor se calcula como `precio_costo * cantidad`.
* **Caja de Reposición:** Es una reserva de efectivo destinada exclusivamente a volver a comprar el stock vendido. Asegura que el negocio nunca se descapitalice.
* **Caja de Ganancias:** Representa la utilidad neta. Es el dinero disponible para sueldos, reinversión de crecimiento o disfrute personal.

---

### 2. El Motor de Cálculo: Flujo de Venta

Cuando se registra una venta, el sistema realiza un "splice" (división) automático basado en el costo y el margen:

| Concepto | Cálculo | Acción en el Sistema |
| :--- | :--- | :--- |
| **Costo del Producto** | `costo_unitario * cantidad` | Se suma a la **Caja de Reposición**. |
| **Margen de Ganancia** | `precio_venta - costo_total` | Se suma a la **Caja de Ganancias**. |
| **Actualización de Activos** | `stock - cantidad` | Se descuenta del **Total Invertido**. |

**Ejemplo Práctico:**
Vendes un producto a **$3.500** que te costó **$2.000**:
1.  **$2.000** entran a la *Caja de Reposición* (dinero asegurado para reponer la unidad).
2.  **$1.500** entran a la *Caja de Ganancias* (tu utilidad).
3.  El *Total Invertido* baja en **$2.000** porque ese activo ya no está en stock.

---

### 3. Gastos Operativos

Los Gastos Operativos representan las salidas de dinero necesarias para mantener la estructura (servicios, impuestos, publicidad, logística).

* **Impacto:** Se registran de forma independiente para calcular la salud financiera.
* **Métrica Final:** `Ganancia Real = (Caja Ganancias) - (Gastos Operativos)`.

---

### 4. Objetivo del Modelo

Este modelo de arquitectura financiera busca proteger al emprendedor del error común de "gastar el costo", permitiendo que el negocio sea **autosustentable** y proporcionando una visión clara de la rentabilidad real en todo momento.


/inversiones-note
├── /components
│   ├── /productos          // Gestiona el "Total Invertido"
│   │   ├── controller.js   // Lógica de cálculo de stock y costos
│   │   ├── network.js      // Rutas: GET /productos, POST /productos
│   │   └── store.js        // Consultas a la DB de productos
│   ├── /ventas             // El motor del sistema
│   │   ├── controller.js   // Lógica de reparto: Ganancia vs Reposición
│   │   ├── network.js      // Rutas: POST /ventas
│   │   └── store.js        // Persistencia de transacciones
│   ├── /gastos             // Gastos operativos
│   │   ├── controller.js   // Lógica de validación de gastos
│   │   ├── network.js      // Rutas: GET /gastos, POST /gastos
│   │   └── store.js        // Persistencia de gastos mensuales
│   └── /dashboard          // Caja de "Totales"
│       ├── controller.js   // Orquestador que suma los saldos de todos los stores
│       └── network.js      // Ruta: GET /resumen-general
├── /network
│   ├── routes.js           // El "Hub" que conecta todos los network.js de los componentes
│   └── response.js         // Estandarización de respuestas (Success / Error)
├── /db                     // Configuración y conexión a la Base de Datos
│   └── index.js
├── /middleware             // Validaciones de seguridad o formatos
├── server.js               // Punto de entrada de la aplicación (Express setup)
├── .env                    // Variables de entorno (puertos, DB_URL)
└── package.json

