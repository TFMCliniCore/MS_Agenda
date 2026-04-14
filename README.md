# MS Agenda Core

Microservicio REST construido con NestJS, Prisma y PostgreSQL para administrar la agenda de clinica veterinaria:

- Citas
- Recordatorios
- Sala de Espera

Este microservicio depende de **MS Entidades Core** para la validacion y enriquecimiento de datos de pacientes, clientes y usuarios mediante HTTP Join.


## Stack

- NestJS
- Prisma ORM
- PostgreSQL 16
- Docker / Docker Compose
- TypeScript


## Dependencias externas

| Servicio | Rol |
| --- | --- |
| `ms-entidades-core` | Provee datos de pacientes, clientes y usuarios via HTTP |

La URL del microservicio externo se configura con la variable de entorno `MS_ENTIDADES_URL`.


## Variables de entorno

```env
PORT=
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB
DATABASE_URL
MS_ENTIDADES_URL
```


## Ejecucion con Docker

```bash
docker compose up --build
```

Servicios disponibles:

- API: `http://<URL_SERVIDOR>:<PUERTO>`
- PostgreSQL: `<URL_SERVIDOR>:<PUERTO>`

Ejemplo para desarrollo:

- API: `http://localhost:3003`
- PostgreSQL: `http://localhost:5433`

Al iniciar el contenedor de la API se ejecutan:

1. Migraciones de Prisma
2. Seed con datos iniciales (requiere que ms-entidades este corriendo)
3. Arranque del servidor NestJS

Parar contenedor:

```bash
docker compose stop
```

Detener contenedor y borrar volumenes:

```bash
docker compose down -v
```

Reconstruir contenedor:

```bash
docker compose up --build
```


## Ejecucion local

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```


## Estructura principal

```text
src/
  citas/
    dto/
      create-cita.dto.ts
      update-cita.dto.ts
    citas.controller.ts
    citas.module.ts
    citas.service.ts
  recordatorios/
    dto/
      create-recordatorio.dto.ts
      update-recordatorio.dto.ts
    recordatorios.controller.ts
    recordatorios.module.ts
    recordatorios.service.ts
  sala-espera/
    dto/
      create-sala-espera.dto.ts
      update-sala-espera.dto.ts
    sala-espera.controller.ts
    sala-espera.module.ts
    sala-espera.service.ts
  entidades-client/
    entidades-client.module.ts
    entidades-client.service.ts
  common/
    constants/
      entity-status.constants.ts
  prisma/
    prisma-client-exception.filter.ts
    prisma.module.ts
    prisma.service.ts
  app.module.ts
  main.ts
prisma/
  migrations/
  schema.prisma
  seed.js
postman/
  MS_Agenda_Core.postman_collection.json
```


## Datos iniciales precargados

El seed crea registros iniciales tomando como referencia los datos del seed de ms-entidades:

- 3 citas (1 completada, 2 pendientes)
- 3 recordatorios
- 3 entradas de sala de espera

> El seed falla si ms-entidades no esta disponible o no tiene al menos 3 pacientes y 2 usuarios.


## URL Base

```text
http://<URL_SERVIDOR>:<puerto>/api/v1
```

La variable `baseUrl` ya viene configurada como (para pruebas en desarrollo):

```text
http://localhost:3003/api/v1
```


## Tabla de endpoints

Todas las rutas usan el prefijo base `/api/v1`.

### Citas

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/api/v1/citas` | Lista todas las citas activas |
| GET | `/api/v1/citas/:id` | Obtiene una cita por id |
| POST | `/api/v1/citas` | Crea una cita |
| PUT | `/api/v1/citas/:id` | Reemplaza una cita |
| PATCH | `/api/v1/citas/:id` | Actualiza una cita |
| DELETE | `/api/v1/citas/:id` | Elimina logicamente una cita |

#### Filtros disponibles en GET `/api/v1/citas`

| Query param | Tipo | Descripcion |
| --- | --- | --- |
| `desde` | date | Filtra citas con fecha >= desde |
| `hasta` | date | Filtra citas con fecha <= hasta |
| `estado` | string | `NO_COMPLETADO`, `COMPLETADO`, `CANCELADO` |
| `pacienteId` | number | Filtra por paciente |
| `tipo` | string | `Consulta`, `Vacunacion`, `Cirugia`, etc. |

---

### Recordatorios

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/api/v1/recordatorios` | Lista todos los recordatorios activos |
| GET | `/api/v1/recordatorios/:id` | Obtiene un recordatorio por id |
| POST | `/api/v1/recordatorios` | Crea un recordatorio |
| PUT | `/api/v1/recordatorios/:id` | Reemplaza un recordatorio |
| PATCH | `/api/v1/recordatorios/:id` | Actualiza un recordatorio |
| DELETE | `/api/v1/recordatorios/:id` | Elimina logicamente un recordatorio |

#### Filtros disponibles en GET `/api/v1/recordatorios`

| Query param | Tipo | Descripcion |
| --- | --- | --- |
| `desde` | ISO date | Filtra por fechaDesde >= desde |
| `hasta` | ISO date | Filtra por fechaHasta <= hasta |
| `estado` | string | `NO_COMPLETADO`, `COMPLETADO`, `CANCELADO` |
| `pacienteId` | number | Filtra por paciente |
| `tipo` | string | Tipo de recordatorio |

---

### Sala de Espera

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/api/v1/sala-espera` | Lista todas las entradas activas |
| GET | `/api/v1/sala-espera/:id` | Obtiene una entrada por id |
| POST | `/api/v1/sala-espera` | Agrega un paciente a la sala |
| PUT | `/api/v1/sala-espera/:id` | Reemplaza una entrada |
| PATCH | `/api/v1/sala-espera/:id` | Actualiza una entrada |
| DELETE | `/api/v1/sala-espera/:id` | Elimina logicamente una entrada |

#### Filtros disponibles en GET `/api/v1/sala-espera`

| Query param | Tipo | Descripcion |
| --- | --- | --- |
| `desde` | ISO date | Filtra entradas con hora >= desde |
| `hasta` | ISO date | Filtra entradas con hora <= hasta |
| `pago` | boolean | `true` o `false` |
| `llamar` | boolean | `true` o `false` |
| `pacienteId` | number | Filtra por paciente |


## Estados posibles

| Entidad | Estado | Descripcion |
| --- | --- | --- |
| Cita | `NO_COMPLETADO` | Cita pendiente (estado inicial) |
| Cita | `COMPLETADO` | Cita realizada |
| Cita | `CANCELADO` | Cita cancelada |
| Recordatorio | `NO_COMPLETADO` | Recordatorio pendiente (estado inicial) |
| Recordatorio | `COMPLETADO` | Recordatorio gestionado |
| Recordatorio | `CANCELADO` | Recordatorio cancelado |


## Ejemplos de payload

### Crear cita

```json
{
  "fecha": "2026-05-20T10:30:00",
  "motivo": "Control post operatorio de la cirugia de esterilizacion.",
  "tipo": "Consulta",
  "pacienteId": 1,
  "usuarioId": 2,
  "recordatorioId": null
}
```

### Actualizar estado de cita

```json
{
  "estado": "COMPLETADO"
}
```

### Crear recordatorio

```json
{
  "motivo": "Recordar al cliente sobre la vacunacion anual.",
  "tipo": "Vacunacion",
  "fechaDesde": "2026-05-18T08:00:00",
  "fechaHasta": "2026-05-20T08:00:00",
  "pacienteId": 2,
  "usuarioId": 1,
  "citaId": 2
}
```

### Agregar paciente a sala de espera

```json
{
  "hora": "2026-05-20T09:15:00",
  "motivo": "Llego para consulta programada.",
  "pago": false,
  "llamar": false,
  "pacienteId": 1,
  "usuarioId": 1
}
```

### Marcar como llamado y pagado

```json
{
  "pago": true,
  "llamar": true
}
```


## Comportamiento del DELETE

El metodo DELETE realiza un **borrado logico**: no elimina fisicamente el registro sino que activa el campo `eliminado = true`. Los registros con `eliminado: true` no aparecen en ninguna consulta GET.

A diferencia de ms-entidades, en ms-agenda el soft delete no bloquea por relaciones ya que las referencias a pacientes, clientes y usuarios son externas (IDs planos sin FK de Prisma).


## Estrategia HTTP Join

Las entidades de este microservicio almacenan `pacienteId`, `clienteId` y `usuarioId` como IDs planos sin foreign keys hacia ms-entidades. Al consultar un recurso (GET por id o GET listado), el service realiza llamadas HTTP a ms-entidades para enriquecer la respuesta:

- **GET por id**: dos llamadas en paralelo (`Promise.all`) para obtener paciente y usuario.
- **GET listado**: una sola llamada por entidad tipo (no por registro), filtrando en memoria con un `Map` para lookup O(1).

```
GET /api/v1/citas
  └─> prisma.cita.findMany()
  └─> fetch /pacientes       (una llamada, todos los pacientes)
  └─> fetch /usuarios        (una llamada, todos los usuarios)
  └─> merge en memoria con Map<id, entidad>
```

Este patron evita N+1 llamadas HTTP al listar colecciones.


## Notas

- No se implemento autenticacion (todavia).
- El campo `clienteId` en citas, recordatorios y sala de espera se obtiene automaticamente desde el objeto `paciente.cliente.id` devuelto por ms-entidades al crear o actualizar. No es necesario enviarlo en el payload.
- El campo `eliminado` maneja el soft delete de forma independiente al campo `estado` de negocio.