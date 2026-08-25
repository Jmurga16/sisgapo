# SISGAPO

Sistema de gestión de almacén de productos orgánicos. Multi-almacén, con categorías,
lotes y control de vencimientos.

Desarrollado en 2021 como proyecto universitario (UNMSM, Ing. de Sistemas) y recuperado
en 2026: documentado, auditado y reparado. La auditoría completa —29 hallazgos
priorizados— está en [`sisgapo-docs/06-hallazgos.md`](sisgapo-docs/06-hallazgos.md).

| Capa | Stack |
|---|---|
| Frontend | Angular 9 + Angular Material |
| Backend | ASP.NET Core 5 (API / Business / Data / Entity) |
| Datos | SQL Server, lógica en stored procedures |

---

## Levantarlo en local

Requisitos: Docker Desktop, .NET SDK (5, 8 o 9) y Node 18+.

### 1. Base de datos

```bash
docker compose up -d
```

Levanta SQL Server, crea `DB_SISGAPO` y carga esquema, procedimientos y datos de
demostración desde [`sisgapo-docs/sql/`](sisgapo-docs/sql/). Es reejecutable: volver a
lanzarlo deja la base en el estado inicial.

> Se publica en el puerto **14330**, no en el 1433, para no chocar con una instancia
> local de SQL Server. Cambia `MSSQL_SA_PASSWORD` copiando `.env.example` a `.env`.

### 2. API

```bash
cd sisgapo-api
export SISGAPO_CONNECTION_STRING='Server=localhost,14330;Database=DB_SISGAPO;User ID=sa;Password=Sisgapo!Demo2026;TrustServerCertificate=True'
dotnet run --project SISGAPO_API
```

En `https://localhost:44360`, con Swagger en `/swagger`.

**La cadena de conexión no se versiona.** Va en la variable de entorno
`SISGAPO_CONNECTION_STRING` o en `dotnet user-secrets`; `appsettings.json` solo tiene un
marcador de posición. En PowerShell:
`$env:SISGAPO_CONNECTION_STRING = '...'`

### 3. Frontend

```bash
cd sisgapo-web
npm install --legacy-peer-deps
npm start
```

En `http://localhost:4200`. Los scripts de `package.json` ya incluyen
`NODE_OPTIONS=--openssl-legacy-provider`, obligatorio en Node 17+ porque Webpack 4 usa
MD4 y OpenSSL 3 no lo expone.

---

## Credenciales de demostración

Todas con la contraseña `123456`.

| Usuario | Rol |
|---|---|
| `admin` | Administrador |
| `jose.m` | Supervisor |
| `lucia.fernandez` | Asistente |

> Las contraseñas se guardan en texto plano, como en el diseño original de 2021. Está
> registrado como hallazgo bloqueante (`06-hallazgos.md` §S-02) y pendiente de arreglo.
> **No expongas esta demo en internet tal cual.**

---

## Documentación

Empieza por [`sisgapo-docs/README.md`](sisgapo-docs/README.md).

| Documento | Para qué |
|---|---|
| `01-analisis-general.md` | Qué hace el sistema y en qué estado está |
| `02-arquitectura.md` | Capas y flujo de un request |
| `03-modelo-de-datos.md` | Tablas, relaciones y procedimientos |
| `04-api-referencia.md` | Endpoints y catálogo de `sOpcion` |
| `05-frontend.md` | Módulos, rutas y servicios de Angular |
| `06-hallazgos.md` | **Auditoría: bugs, deuda técnica y seguridad** |
| `07-migracion-tier-free.md` | Plan de despliegue a coste US$ 0 |
| `08-plan-demo.md` | Cómo presentarlo |
| `09-mejoras-propuestas.md` | Roadmap |
| `10-decisiones.md` | Decisiones tomadas y alternativas descartadas |
