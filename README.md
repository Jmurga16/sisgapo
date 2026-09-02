# SISGAPO

Sistema de gestión de almacén de productos orgánicos. Multi-almacén, con categorías,
lotes y control de vencimientos.

Desarrollado en 2021 como proyecto universitario (UNMSM, Ing. de Sistemas) y recuperado
en 2026: documentado, auditado y reparado. La auditoría completa —37 hallazgos
priorizados— está en [`sisgapo-docs/06-hallazgos.md`](sisgapo-docs/06-hallazgos.md).

| Capa | Stack |
|---|---|
| Frontend | Angular 9 + Angular Material |
| Backend | ASP.NET Core 8 (API / Business / Data / Entity), JWT |
| Datos | SQL Server, lógica en stored procedures |

---

## Levantarlo en local

Requisitos: Docker Desktop, .NET SDK 8 o 9, y Node 18+.

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
dotnet run --project SISGAPO_API
```

En `https://localhost:44360`, con Swagger en `/swagger`. Swagger trae el botón
*Authorize*: pega ahí el token que devuelve `POST /LoginService` para probar el resto.

En local no hace falta configurar nada: `appsettings.Development.json` trae la cadena de
conexión del contenedor y una clave JWT de desarrollo. Las dos son públicas y no valen
fuera de tu máquina — ese es justamente el motivo por el que se pueden versionar.

**Fuera de `Development` no hay valores por defecto:** la API exige las variables de
entorno de la tabla de abajo y falla con un mensaje explícito si faltan.

### 3. Frontend

```bash
cd sisgapo-web
npm install --legacy-peer-deps
npm start
```

En `http://localhost:4200`. Los scripts de `package.json` ya incluyen
`NODE_OPTIONS=--openssl-legacy-provider`, obligatorio en Node 17+ porque Webpack 4 usa
MD4 y OpenSSL 3 no lo expone.

### Secretos

`appsettings.json` solo tiene marcadores de posición. Estos son los valores que hay que
dar por configuración —variables de entorno, `dotnet user-secrets` en local, o los
*secrets* del servicio donde se despliegue— en cualquier entorno que no sea `Development`:

| Variable | Para qué | Requisito |
|---|---|---|
| `SISGAPO_CONNECTION_STRING` | Cadena de conexión a SQL Server | Sin ella la API no responde a nada que toque datos |
| `SISGAPO_JWT_KEY` | Clave con la que se firman los tokens | Mínimo 32 caracteres (HMAC-SHA256 firma con 256 bits) |

Y estos dos, que no son secretos pero sí cambian por entorno:

| Clave de `appsettings.json` | Para qué | Por defecto |
|---|---|---|
| `Cors:OrigenesPermitidos` | Dominios del frontend autorizados | `http://localhost:4200` |
| `Jwt:MinutosVigencia` | Duración del token | `480` (8 h) |

Cambiar `SISGAPO_JWT_KEY` invalida todas las sesiones abiertas, que es justo lo que se
quiere si alguna vez se filtra. Para generar una:

```bash
openssl rand -base64 48
```

En despliegue, `MSSQL_SA_PASSWORD` del `docker-compose.yml` deja de aplicar: ahí la base
la da el proveedor y su contraseña vive dentro de `SISGAPO_CONNECTION_STRING`.

---

## Credenciales de demostración

Todas con la contraseña `123456`.

| Usuario | Rol |
|---|---|
| `admin` | Administrador |
| `jose.m` | Supervisor |
| `lucia.fernandez` | Asistente |

Los tres roles ven cosas distintas: el administrador es el único que entra a Usuarios,
el asistente no ve Almacenes ni Zonas. `jorge.salazar` está dado de baja y no puede
entrar, que es justamente lo que se comprueba.

> Las contraseñas se guardan con bcrypt. La contraseña compartida y documentada es una
> licencia de la demo, no del diseño: en el original de 2021 estaban en texto plano
> (`06-hallazgos.md`, S-02).
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
