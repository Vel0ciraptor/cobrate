# Sistema de Gestión de Cobros

## 1. Objetivo

Desarrollar una aplicación web sencilla para administrar clientes,
registrar pagos y controlar de forma visual quién pagó, quién está
pendiente, cuánto debe cada cliente y cuánto dinero se ha cobrado.

### Stack obligatorio

-   Frontend: React
-   Backend: Node.js + Express
-   Base de datos: PostgreSQL
-   Autenticación: JWT o sesión segura
-   Diseño: CSS puro o una librería UI ligera
-   Responsive: escritorio, tablet y móvil

### Alcance

El sistema tendrá únicamente un usuario/administrador.

No implementar en esta primera versión:

-   Roles y permisos múltiples
-   Multiempresa
-   App móvil nativa
-   Microservicios
-   Redis
-   Sistema contable completo
-   Integraciones externas
-   Pasarelas de pago
-   WhatsApp automático

------------------------------------------------------------------------

# 2. Acceso administrativo

La aplicación debe comenzar con una pantalla de login.

### Campos

-   Usuario o correo
-   Contraseña

### Requisitos

-   Contraseña almacenada mediante hash seguro.
-   Las rutas administrativas deben estar protegidas.
-   Si el usuario no está autenticado, debe ser redirigido al login.
-   Mantener una única cuenta administrativa.

------------------------------------------------------------------------

# 3. Dashboard

El dashboard será la pantalla principal.

Debe mostrar de forma inmediata el estado general de los cobros.

## Tarjetas principales

### Total cobrado

Suma de todos los pagos registrados dentro del período seleccionado.

### Total pendiente

Suma de las cuotas pendientes/vencidas de los clientes.

### Clientes activos

Cantidad de clientes activos.

### Pagos de hoy

Cantidad y monto de pagos que corresponden al día actual.

### Vencidos

Cantidad y monto de cuotas cuya fecha de pago ya pasó y todavía no
fueron pagadas.

------------------------------------------------------------------------

# 4. Filtro de período

El dashboard debe permitir seleccionar:

-   Hoy
-   Esta semana
-   Este mes
-   Este año
-   Personalizado

El filtro debe afectar principalmente los valores de cobros y pagos
mostrados.

------------------------------------------------------------------------

# 5. Tabla principal de clientes

Mostrar una tabla con información resumida.

  Campo          Descripción
  -------------- -------------------------------
  Cliente        Nombre completo
  Teléfono       Número de contacto
  Monto          Monto de la cuota
  Frecuencia     Diario / Semanal / Mensual
  Próximo pago   Próxima fecha programada
  Estado         Pagado / Pendiente / Vencido
  Deuda          Monto pendiente
  Acciones       Ver / Editar / Registrar pago

## Estados

### Pagado

El cliente ya realizó el pago correspondiente al período actual.

### Pendiente

El cliente todavía debe pagar, pero la fecha de vencimiento todavía no
pasó.

### Vencido

La fecha de pago ya pasó y el pago correspondiente todavía no fue
registrado.

------------------------------------------------------------------------

# 6. Gestión de clientes

Crear una sección `/clientes`.

Debe permitir:

-   Listar clientes.
-   Buscar clientes.
-   Agregar cliente.
-   Editar cliente.
-   Desactivar cliente.
-   Ver historial de pagos.

## Crear cliente

Campos:

``` text
Nombre completo *
Teléfono
Monto de cobro *
Frecuencia *
Fecha de inicio *
Fecha de próximo pago *
Día de pago
Observaciones
```

### Frecuencia

Valores permitidos:

``` text
DAILY
WEEKLY
MONTHLY
```

En interfaz:

``` text
Diario
Semanal
Mensual
```

------------------------------------------------------------------------

# 7. Configuración de fechas de pago

El sistema debe permitir definir cómo se calcula el siguiente pago.

## Diario

Ejemplo:

``` text
Monto: 20 Bs
Frecuencia: Diario
Próximo pago: 19/09/2026
```

Después de registrar el pago:

``` text
Próximo pago: 20/09/2026
```

## Semanal

Ejemplo:

``` text
Monto: 100 Bs
Frecuencia: Semanal
Día: Lunes
```

Después de registrar el pago se calcula automáticamente el siguiente
lunes.

## Mensual

Ejemplo:

``` text
Monto: 500 Bs
Frecuencia: Mensual
Día: 5
```

Después de registrar el pago:

``` text
Próximo pago: día 5 del siguiente mes
```

### Consideraciones

El cálculo de fechas debe manejar correctamente:

-   Meses con diferente cantidad de días.
-   Febrero.
-   Cambio de año.
-   Fechas pasadas.
-   Clientes creados con una fecha de inicio anterior.

Si se configura un día mensual que no existe en determinado mes,
utilizar el último día válido de ese mes.

Ejemplo:

``` text
Día configurado: 31
Febrero: 28/29
Abril: 30
Mayo: 31
```

------------------------------------------------------------------------

# 8. Registro de pagos

Crear una acción:

``` text
Registrar pago
```

Al hacer clic, mostrar un modal/formulario.

## Campos

``` text
Cliente
Monto
Fecha de pago
Período correspondiente
Observación
```

El monto debe venir precargado con el monto configurado para el cliente,
pero permitir modificarlo si es necesario.

## Al registrar el pago

El backend debe:

1.  Validar el cliente.
2.  Validar el monto.
3.  Registrar el pago.
4.  Asociar el pago al cliente.
5.  Actualizar la próxima fecha de pago.
6.  Actualizar el estado del cliente.
7.  Actualizar los valores del dashboard.

Todo debe ejecutarse mediante una transacción de PostgreSQL para evitar
datos inconsistentes.

------------------------------------------------------------------------

# 9. Historial de pagos

Cada cliente debe tener una vista de historial.

Ejemplo:

  Fecha           Monto Período      Estado      Observación
  ------------ -------- ------------ ----------- -------------
  01/09/2026     100 Bs Septiembre   Pagado      
  08/09/2026     100 Bs Semana 2     Pagado      
  15/09/2026     100 Bs Semana 3     Pagado      
  22/09/2026     100 Bs Semana 4     Pendiente   

Funciones:

-   Ver pagos.
-   Filtrar por fecha.
-   Ver monto total pagado.
-   Ver períodos pendientes.
-   Corregir/eliminar un pago solamente desde el administrador.

------------------------------------------------------------------------

# 10. Cálculo de deuda

La deuda debe calcularse con base en las cuotas que correspondan y los
pagos registrados.

Conceptualmente:

``` text
Deuda = cuotas generadas - pagos realizados
```

No depender únicamente de un campo manual de deuda.

La información financiera debe poder reconstruirse a partir de los
registros de pagos y la configuración de cobro.

------------------------------------------------------------------------

# 11. Notificaciones internas

No implementar notificaciones externas inicialmente.

El dashboard debe mostrar alertas visuales.

## Pagos vencidos

``` text
🔴 5 clientes tienen pagos vencidos
```

## Pagos de hoy

``` text
🟡 8 clientes deben pagar hoy
```

## Pagos registrados

Después de registrar un pago:

``` text
✓ Pago registrado correctamente
```

------------------------------------------------------------------------

# 12. Base de datos PostgreSQL

## Tabla `users`

``` sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

------------------------------------------------------------------------

## Tabla `clients`

``` sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),

    amount NUMERIC(12,2) NOT NULL,

    frequency VARCHAR(20) NOT NULL
        CHECK (frequency IN ('DAILY', 'WEEKLY', 'MONTHLY')),

    payment_day INTEGER,

    start_date DATE NOT NULL,
    next_payment_date DATE NOT NULL,

    active BOOLEAN DEFAULT TRUE,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `payment_day`

Uso:

-   `DAILY`: puede ser `NULL`.
-   `WEEKLY`: almacenar el día de la semana.
-   `MONTHLY`: almacenar el día del mes.

Recomendación para semanal:

``` text
1 = lunes
2 = martes
3 = miércoles
4 = jueves
5 = viernes
6 = sábado
7 = domingo
```

------------------------------------------------------------------------

## Tabla `payments`

``` sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    client_id UUID NOT NULL
        REFERENCES clients(id)
        ON DELETE RESTRICT,

    amount NUMERIC(12,2) NOT NULL,

    payment_date DATE NOT NULL,

    period_start DATE,
    period_end DATE,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

------------------------------------------------------------------------

# 13. Índices

Crear índices para las consultas principales:

``` sql
CREATE INDEX idx_clients_next_payment
ON clients(next_payment_date);

CREATE INDEX idx_clients_active
ON clients(active);

CREATE INDEX idx_payments_client
ON payments(client_id);

CREATE INDEX idx_payments_date
ON payments(payment_date);
```

------------------------------------------------------------------------

# 14. API Backend

Base:

``` text
/api
```

## Autenticación

### POST

``` text
/api/auth/login
```

Request:

``` json
{
  "username": "admin",
  "password": "********"
}
```

Response:

``` json
{
  "token": "...",
  "user": {
    "id": "...",
    "username": "admin"
  }
}
```

------------------------------------------------------------------------

# 15. Clientes API

### GET

``` text
/api/clients
```

Listar clientes.

Filtros opcionales:

``` text
?status=pending
?status=overdue
?search=juan
```

### GET

``` text
/api/clients/:id
```

Obtener información de un cliente.

### POST

``` text
/api/clients
```

Crear cliente.

### PUT

``` text
/api/clients/:id
```

Editar cliente.

### DELETE

``` text
/api/clients/:id
```

No eliminar físicamente si tiene pagos asociados.

Preferiblemente:

``` text
active = false
```

------------------------------------------------------------------------

# 16. Pagos API

### GET

``` text
/api/payments
```

Filtros:

``` text
?client_id=
?from=
?to=
```

### POST

``` text
/api/payments
```

Registrar pago.

### DELETE

``` text
/api/payments/:id
```

Eliminar/corregir pago como administrador.

El backend debe recalcular la información afectada después de modificar
un pago.

------------------------------------------------------------------------

# 17. Dashboard API

### GET

``` text
/api/dashboard
```

Response aproximada:

``` json
{
  "totalCollected": 15000,
  "totalPending": 3500,
  "activeClients": 48,
  "todayPayments": {
    "count": 8,
    "amount": 1200
  },
  "overdue": {
    "count": 5,
    "amount": 900
  }
}
```

También devolver:

``` json
{
  "todayClients": [],
  "overdueClients": [],
  "upcomingClients": []
}
```

------------------------------------------------------------------------

# 18. Estructura del frontend

Propuesta:

``` text
src/
├── components/
│   ├── DashboardCard.jsx
│   ├── ClientTable.jsx
│   ├── ClientForm.jsx
│   ├── PaymentModal.jsx
│   └── StatusBadge.jsx
│
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Clients.jsx
│   └── ClientDetails.jsx
│
├── services/
│   ├── api.js
│   ├── auth.js
│   ├── clients.js
│   └── payments.js
│
├── hooks/
│   └── ...
│
├── utils/
│   └── dates.js
│
├── App.jsx
└── main.jsx
```

------------------------------------------------------------------------

# 19. Navegación

Menú lateral o superior:

``` text
Dashboard
Clientes
Pagos
```

Opcional:

``` text
Configuración
Cerrar sesión
```

No crear demasiadas pantallas.

------------------------------------------------------------------------

# 20. Diseño UI

Objetivo:

-   Simple.
-   Rápido.
-   Limpio.
-   Fácil de utilizar.
-   Responsive.

El administrador debe poder saber el estado del negocio en menos de unos
segundos después de entrar.

### Colores de estado

No depender únicamente del color para comunicar estados.

Usar:

``` text
Pagado    → indicador verde + texto
Pendiente → indicador amarillo + texto
Vencido   → indicador rojo + texto
```

------------------------------------------------------------------------

# 21. Reglas importantes del sistema

### Regla 1

Un cliente puede tener múltiples pagos.

### Regla 2

Los pagos nunca deben modificar manualmente el historial anterior.

### Regla 3

Cada pago debe tener fecha.

### Regla 4

La próxima fecha de pago debe actualizarse automáticamente.

### Regla 5

Un cliente desactivado no debe aparecer como cliente activo.

### Regla 6

Los pagos históricos de un cliente desactivado deben conservarse.

### Regla 7

No eliminar clientes físicamente cuando existan pagos asociados.

### Regla 8

Los cálculos importantes deben realizarse en el backend.

El frontend solamente presenta los datos.

------------------------------------------------------------------------

# 22. Seguridad mínima

Implementar:

-   Password hashing con bcrypt/argon2.
-   JWT o sesión segura.
-   Middleware de autenticación.
-   Validación de datos en backend.
-   Queries parametrizadas/ORM.
-   Variables sensibles en `.env`.
-   CORS configurado correctamente.
-   No devolver `password_hash` en ninguna respuesta.

Ejemplo `.env`:

``` env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/cobros
JWT_SECRET=change_this_secret
```

------------------------------------------------------------------------

# 23. Arquitectura

Mantener una arquitectura monolítica sencilla:

``` text
React
   │
   │ HTTP/REST
   ▼
Node.js + Express
   │
   │ SQL/ORM
   ▼
PostgreSQL
```

No crear microservicios.

------------------------------------------------------------------------

# 24. Flujo principal

## Crear cliente

``` text
Admin
 ↓
Clientes
 ↓
Nuevo cliente
 ↓
Completar datos
 ↓
Guardar
 ↓
PostgreSQL
 ↓
Calcular próxima fecha
 ↓
Cliente aparece en Dashboard
```

## Registrar pago

``` text
Admin
 ↓
Dashboard / Cliente
 ↓
Registrar pago
 ↓
Ingresar monto y fecha
 ↓
Backend valida
 ↓
Crear payment
 ↓
Calcular siguiente fecha
 ↓
Actualizar client
 ↓
Dashboard actualizado
```

------------------------------------------------------------------------

# 25. Criterios de aceptación

El sistema estará listo cuando:

-   [ ] El administrador pueda iniciar sesión.
-   [ ] El administrador pueda crear clientes.
-   [ ] Se pueda definir cobro diario.
-   [ ] Se pueda definir cobro semanal.
-   [ ] Se pueda definir cobro mensual.
-   [ ] Se pueda definir la fecha de pago.
-   [ ] El sistema calcule automáticamente el siguiente pago.
-   [ ] Se puedan registrar pagos.
-   [ ] Cada cliente tenga historial.
-   [ ] Se pueda consultar cuánto debe cada cliente.
-   [ ] Se puedan identificar pagos pendientes.
-   [ ] Se puedan identificar pagos vencidos.
-   [ ] Se puedan identificar pagos del día.
-   [ ] El dashboard muestre total cobrado.
-   [ ] El dashboard muestre total pendiente.
-   [ ] El dashboard muestre cantidad de clientes.
-   [ ] Se puedan buscar clientes.
-   [ ] Se puedan editar clientes.
-   [ ] Se puedan desactivar clientes.
-   [ ] Los pagos históricos se conserven.
-   [ ] El sistema funcione correctamente en móvil.
-   [ ] Las rutas administrativas estén protegidas.
-   [ ] Los datos financieros se calculen en backend.
-   [ ] PostgreSQL sea la fuente principal de información.

------------------------------------------------------------------------

# 26. Prioridad de desarrollo

## Fase 1 - Base

1.  Crear proyecto React.
2.  Crear API Node.js/Express.
3.  Configurar PostgreSQL.
4.  Crear migraciones/tablas.
5.  Crear usuario administrador.
6.  Implementar login.

## Fase 2 - Clientes

1.  CRUD de clientes.
2.  Frecuencia de pago.
3.  Fechas de pago.
4.  Cálculo de próxima fecha.
5.  Estados del cliente.

## Fase 3 - Pagos

1.  Registrar pago.
2.  Historial.
3.  Cálculo de deuda.
4.  Actualización automática de próxima fecha.
5.  Corrección/eliminación administrativa.

## Fase 4 - Dashboard

1.  Totales.
2.  Pagos de hoy.
3.  Pendientes.
4.  Vencidos.
5.  Próximos pagos.
6.  Filtros por período.

## Fase 5 - Finalización

1.  Responsive.
2.  Validaciones.
3.  Manejo de errores.
4.  Seguridad.
5.  Pruebas.
6.  Deploy en VPS.

------------------------------------------------------------------------

# 27. Principio general

La primera versión debe ser deliberadamente simple.

El objetivo no es crear un ERP.

El objetivo es responder rápidamente estas preguntas:

``` text
¿Quién pagó?
¿Quién no pagó?
¿Quién está vencido?
¿Cuánto me deben?
¿Cuánto cobré?
¿Quién debe pagar hoy?
¿Quién debe pagar próximamente?
```

Si una funcionalidad no ayuda directamente a responder estas preguntas,
dejarla fuera de la primera versión.
