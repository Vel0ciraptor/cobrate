# Notas - Sistema de Gestión de Cobros 💵

Aplicación web moderna y ágil para la administración de clientes, control de cobros periódicos, cálculo de deudas, exportación a Excel/CSV y métricas financieras en tiempo real, desarrollada con base en la especificación técnica de `sistema_gestion_cobros.md`.

---

## 🚀 Inicio Rápido

### Requisitos
- **Node.js**: v18 o superior (probado en Node v24).
- **Base de Datos**: PostgreSQL estándar (opcional gracias al motor integrado PGlite con persistencia local en disco para desarrollo sin configuración adicional).

### 1. Iniciar el Backend (API)
```bash
cd backend
npm install   # Si no se han instalado dependencias
npm run dev   # O npm start
```
El servidor backend se iniciará en `http://localhost:5000/api`.
*Si tienes un PostgreSQL en ejecución, puedes configurar tu cadena de conexión en `backend/.env` (`DATABASE_URL`). Si no, el sistema utiliza automáticamente PostgreSQL integrado con almacenamiento en disco.*

### 2. Iniciar el Frontend (React + Vite)
```bash
cd frontend
npm install   # Si no se han instalado dependencias
npm run dev
```
La aplicación web estará disponible en `http://localhost:5173`.

---

## 🔐 Credenciales de Acceso Inicial

| Campo | Valor por Defecto |
|---|---|
| **Usuario** | `admin` |
| **Contraseña** | `admin123` |

*(Estas credenciales pueden modificarse en el archivo `backend/.env`).*

---

## 📊 Características y Funcionalidades

1. **Acceso Administrativo Seguro**:
   - Autenticación mediante JSON Web Tokens (JWT).
   - Hashing seguro de contraseñas con `bcrypt`.
   - Protección de rutas en backend y frontend.

2. **Dashboard Financiero**:
   - **Total Cobrado**: Suma de pagos según el período seleccionado.
   - **Total Pendiente**: Cálculo dinámico de cuotas acumuladas en mora.
   - **Clientes Activos**: Conteo de clientes vigentes.
   - **Pagos de Hoy**: Clientes que deben pagar en la fecha actual.
   - **Vencidos**: Alertas destacadas con cantidad y monto en mora.
   - **Filtro de Período**: Hoy, Esta semana, Este mes, Este año y Personalizado (Desde/Hasta).

3. **Gestión de Clientes (`/clientes`)**:
   - Altas, modificaciones y desactivación suave (`active = false`).
   - Búsqueda en vivo por nombre y teléfono.
   - Frecuencias admitidas: **Diario**, **Semanal** (día configurable de lunes a domingo) y **Mensual** (día configurable 1-31).
   - Contacto directo por WhatsApp en un clic.

4. **Lógica de Cobros y Fechas**:
   - **Diario**: Cálculo automático sumando 1 día al registrar pago.
   - **Semanal**: Avance de 7 días o fijación al día de la semana estipulado.
   - **Mensual**: Cálculo al día del siguiente mes, con manejo de meses cortos y febrero.

5. **Registro Transaccional de Pagos**:
   - Modal de cobro rápido precargando monto y fecha.
   - Registro atómico en PostgreSQL con avance automático de `next_payment_date`.
   - Actualización inmediata del estado a Pagado, Pendiente o Vencido.

6. **Ficha y Auditoría de Pagos**:
   - Detalle individual de cliente con historial completo de transacciones.
   - Auditoría global de todos los pagos con filtros de fecha.
   - Corrección y anulación de pagos exclusivamente para el administrador con recálculo automático de saldos.

7. **Exportación Inmediata a Excel / CSV (.csv / .xls)**:
   - Descarga rápida y 100% segura de la cartera de clientes, estados de deuda e historial de pagos.
   - Formateado con codificación UTF-8 BOM para apertura perfecta y directa en Microsoft Excel sin caracteres extraños ni pérdida de acentos.

8. **Optimización Móvil Ergonómica**:
   - Botones flotantes (FAB) de **+ Cliente** y **Cobrar** en la parte inferior derecha para acceso rápido con el pulgar.
   - Barra de menú inferior móvil con diseño limpio y botones homogéneos.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 18, Vite, Lucide Icons, Vanilla CSS modular (diseño fintech oscuro con acentos violeta y esmeralda, 100% responsivo).
- **Backend**: Node.js, Express, `pg` (PostgreSQL driver), `@electric-sql/pglite` (fallback PostgreSQL persistente), JWT, Bcrypt.
- **Base de Datos**: Esquema relacional con tablas `users`, `clients`, `payments` e índices de alto rendimiento.
