# SISGAPO

[![CI](https://github.com/Jmurga16/sisgapo/actions/workflows/ci.yml/badge.svg)](https://github.com/Jmurga16/sisgapo/actions/workflows/ci.yml)

Sistema de gestión de almacén de productos orgánicos. Multi-almacén, con categorías,
lotes y control de vencimientos.

Desarrollado en 2021 como proyecto universitario (UNMSM, Ing. de Sistemas) y recuperado
en 2026: documentado, auditado y reparado. La auditoría de la recuperación —48 hallazgos,
los 48 cerrados— está en
[`sisgapo-docs/historico/hallazgos-2026.md`](sisgapo-docs/historico/hallazgos-2026.md), y la
del cierre, en
[`sisgapo-docs/historico/auditoria-cierre-2026-10.md`](sisgapo-docs/historico/auditoria-cierre-2026-10.md).
No queda ningún hallazgo abierto. Lo que se podría hacer y no se hace, con su motivo, está
en [`sisgapo-docs/08-mejoras-posibles.md`](sisgapo-docs/08-mejoras-posibles.md), y cómo se
usa la aplicación, en
[`sisgapo-docs/10-manual-de-usuario.md`](sisgapo-docs/10-manual-de-usuario.md).

**Estado:** cerrado como demo de portafolio el 2 de octubre de 2026. Desde el 4 de octubre
la demo corre en un VPS propio, en contenedores.

## Pruébala

**Demo en vivo:** https://sisgapo.devkora.com

Entra con un clic desde la pantalla de acceso, o usa una de estas cuentas:

| Usuario | Contraseña | Rol |
|---|---|---|
| `demo.admin` | `SisgapoDemo2026!` | Administrador — usuarios y mantenimiento de zonas |
| `demo.supervisor` | `SisgapoDemo2026!` | Supervisor — almacenes, productos, lotes y ajustes |
| `demo.asistente` | `SisgapoDemo2026!` | Asistente — consulta y registra entradas y salidas |

> Es una demo con datos de prueba: puedes crear, editar y mover inventario libremente.
> Cada noche, a las 03:00 de Lima (04:00 de finales de octubre a finales de marzo), los
> datos vuelven a su estado inicial.

| Capa | Stack |
|---|---|
| Frontend | Angular 14 + Angular Material |
| Backend | ASP.NET Core 10 (API / Business / Data / Entity), JWT |
| Datos | SQL Server, lógica en stored procedures |

---

## Capturas

### Panel de control

![Panel de control con resumen y distribución del inventario](sisgapo-docs/capturas/panel.png)

| Acceso | Gestión de productos |
|---|---|
| ![Pantalla de acceso](sisgapo-docs/capturas/login.png) | ![Listado y filtros de productos](sisgapo-docs/capturas/productos.png) |

### En un teléfono

Los listados no se leen como tabla: cada registro pasa a ser una tarjeta con sus rótulos,
y el kardex entra por la cronología en vez de por la tabla de diez columnas.

| Lotes | Kardex |
|---|---|
| ![Listado de lotes en un teléfono](sisgapo-docs/capturas/movil-lotes.png) | ![Cronología de movimientos en un teléfono](sisgapo-docs/capturas/movil-kardex.png) |

Las capturas usan los datos que crea `docker compose`: muestran el sistema ejecutándose
contra SQL Server, no una maqueta estática.

---

## Levantarlo en local

Requisitos: Docker Desktop, .NET SDK 10 y Node 18+.

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
npm install
npm start
```

En `http://localhost:4200`. Funciona en Node 22 y en Node 24 sin flags.

### Secretos

`appsettings.json` solo tiene marcadores de posición. Estos son los valores que hay que
dar por configuración —variables de entorno, `dotnet user-secrets` en local, o los
*secrets* del servicio donde se despliegue— en cualquier entorno que no sea `Development`:

| Variable | Para qué | Requisito |
|---|---|---|
| `SISGAPO_CONNECTION_STRING` | Cadena de conexión a SQL Server | Sin ella la API no responde a nada que toque datos |
| `SISGAPO_JWT_KEY` | Clave con la que se firman los tokens | Mínimo 32 caracteres (HMAC-SHA256 firma con 256 bits) |

Y estas tres, que no son secretos pero sí cambian por entorno:

| Clave de `appsettings.json` | Para qué | Por defecto |
|---|---|---|
| `Cors:OrigenesPermitidos` | Dominios del frontend autorizados | `http://localhost:4200` |
| `Jwt:MinutosVigencia` | Duración del token | `480` (8 h) |
| `Demo:SoloLectura` | Bloquea altas, ediciones y cambios de estado | `false` |

Cambiar `SISGAPO_JWT_KEY` invalida todas las sesiones abiertas, que es justo lo que se
quiere si alguna vez se filtra. Para generar una:

```bash
openssl rand -base64 48
```

En el VPS, `MSSQL_SA_PASSWORD` del `docker-compose.yml` deja de aplicar: la base la levanta
`deploy/compose.yaml` con sus propias contraseñas, en un `.env` que no sale del servidor
(plantilla en `deploy/env.example`).

El modo de consulta, `Demo__SoloLectura=true`, hace que la API devuelva 403 ante cualquier
escritura y que el frontend oculte o deshabilite esas acciones. Está desactivado en local y
en la demo pública, que deja crear y mover libremente porque sus datos vuelven al seed cada
noche; sirve para cerrarla de forma puntual.

---

## Pruebas y CI

```bash
dotnet test sisgapo-api/SISGAPO_Back.sln --configuration Release
```

La suite unitaria cubre autenticación con bcrypt, usuarios inactivos, hashes corruptos,
validación de usuarios, modo demo y el rechazo del delimitador y del `pParametro` legado.

Las pruebas de integración se ejecutan contra SQL Server y cubren las reglas de Lotes y
Movimientos —salida que deja el lote en negativo, ajuste sin diferencia, movimiento sin
motivo, baja de un lote con existencia, código de lote repetido, unidad homogénea entre
partidas—, el invariante del módulo —la existencia de un lote es siempre la suma de su
kardex— y las reglas de Usuarios y Almacenes: documento repetido, supervisor sin ese rol,
nombre de almacén repetido y las respuestas `cod|mensaje`. Necesitan la base cargada:

```bash
docker compose up -d
export SISGAPO_TEST_CONNECTION_STRING='Server=localhost,14330;Database=DB_SISGAPO;User ID=sa;Password=Sisgapo!Demo2026;TrustServerCertificate=True'
dotnet test sisgapo-api/Test/Test.csproj --configuration Release
```

Sin esa variable se omiten y el resto de la suite pasa igual.

El workflow de GitHub Actions tiene tres trabajos: compila la solución .NET y ejecuta las
unitarias, levanta SQL Server con `docker compose` para las de integración, y genera el build
de producción de Angular. Se ejecuta en cada push y pull request a `main`.

El workflow es únicamente CI: no publica la aplicación. La demo se despliega a mano, con el
CI en verde, mediante `bash deploy/deploy.sh`, que sube al VPS lo commiteado y se niega si hay
cambios sin commit. Ver `sisgapo-docs/06-infraestructura.md`.

---

## Qué puede hacer cada cuenta

Las tres cuentas de la tabla de arriba comparten contraseña y cubren los tres roles.
El Administrador es el único que mantiene Usuarios y Zonas. El Supervisor gestiona almacenes,
categorías, productos y lotes (Zonas las ve, pero no las edita). El Asistente registra
movimientos de inventario pero no puede ajustar existencias ni mantener lotes, así que sirve
para comprobar que menús y escrituras cambian según el rol.

> Las contraseñas se guardan con bcrypt. La contraseña compartida y documentada es una
> licencia de la demo, no del diseño: en el original de 2021 estaban en texto plano
> (`sisgapo-docs/historico/hallazgos-2026.md`, S-02).
> Lo que protege la demo pública es el reinicio nocturno de los datos (cron del VPS,
> `sisgapo-docs/06-infraestructura.md`, sección 1).

Al crear usuarios nuevos se exige una contraseña inicial de al menos 8 caracteres. Editar
los datos de una persona no cambia su contraseña. No se incluye recuperación porque la demo
no tendrá cuentas reales.

---

## Documentación

Empieza por [`sisgapo-docs/README.md`](sisgapo-docs/README.md).

| Documento | Para qué |
|---|---|
| `00-convenciones.md` | Notación, capas, el contrato `sOpcion`/`parametros` y estilo |
| `01-analisis-general.md` | Qué hace el sistema y en qué estado está |
| `02-arquitectura.md` | Capas y flujo de un request |
| `03-modelo-de-datos.md` | Tablas, relaciones y procedimientos |
| `04-api-referencia.md` | Endpoints y catálogo de `sOpcion` |
| `05-frontend.md` | Módulos, rutas y servicios de Angular |
| `06-infraestructura.md` | Infraestructura y costos: qué corre hoy y cómo redesplegarlo |
| `07-plan-demo.md` | Cómo presentarlo |
| `08-mejoras-posibles.md` | Lo que se podría hacer y no se hace, con su motivo |
| `09-decisiones.md` | Decisiones tomadas y alternativas descartadas |
| `10-manual-de-usuario.md` | Cómo se usa: acceso, permisos por rol y cada pantalla |
| `historico/` | Las dos auditorías de 2026, ya cerradas, las mejoras aplicadas, el plan de la migración al VPS, el estado inicial y el documento de casos de uso de 2021 |
