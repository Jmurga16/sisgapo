# 07 — Migración a tier gratuito

Objetivo: **US$ 0/mes**, con la aplicación funcionando y presentable a un cliente.

## 1. Lo primero: puede que ya no estés pagando

Antes de planificar nada, comprueba qué existe todavía en Azure. La resolución DNS sugiere
que la infraestructura ya se desmanteló:

```
servidorsqlsan.database.windows.net    → NXDOMAIN
sisgapoback.azurewebsites.net          → NXDOMAIN
sisgapo.azurewebsites.net              → NXDOMAIN
```

**Acción inmediata (10 minutos):**

1. Entra al portal de Azure → *Cost Management* → *Análisis de costos*, filtra por los últimos 3 meses.
2. Revisa los grupos de recursos. El ARM menciona uno llamado `recursql`.
3. Si aparece un **App Service Plan** sin aplicaciones dentro, bórralo. Un plan S1 factura ~US$ 73/mes **aunque no tenga ninguna app desplegada** — es el error de facturación más común en Azure.
4. Si no hay nada, ya estás en US$ 0 y este documento pasa de "plan de rescate" a "plan de reconstrucción".

**Dos consecuencias importantes de que la base de datos ya no exista:**

- **No hay datos que exportar.** Esto no es una migración, es una reconstrucción desde los scripts SQL. Menos trabajo y menos riesgo.
- **No estás atado a ningún motor.** Sin datos existentes, elegir SQL Server, PostgreSQL o SQLite es una decisión libre. El único coste de cambiar es reescribir T-SQL.

## 2. De dónde venía el costo

| Recurso | SKU | Precio de lista (East US) | % del total |
|---|---|---|---|
| App Service Plan | **S1 Standard** | ~US$ 73/mes | **94 %** |
| Azure SQL Database | Basic, 5 DTU, 2 GB | ~US$ 5/mes | 6 % |
| Azure Static Web Apps | Free | US$ 0 | 0 % |
| **Total** | | **~US$ 78/mes** | |

**La base de datos nunca fue el problema.** El 94 % del gasto era un App Service Plan
Standard S1 para servir una API que atiende, como mucho, a una persona enseñando una demo.
Un S1 da 100 ACU, 1,75 GB de RAM y ranuras de despliegue: nada de eso hace falta aquí.

Si solo pudieras cambiar una cosa, cambia el App Service Plan. La migración de base de datos
que planteas es correcta, pero ahorra US$ 5 de los US$ 78.

## 3. Requisito técnico previo: salir de .NET 5

Este es el punto que condiciona todo lo demás.

**.NET 5 lleva fuera de soporte desde mayo de 2022 y Azure App Service ya no lo ofrece como
pila de runtime.** No es que sea inseguro (que lo es): es que **no se puede desplegar** en un
App Service nuevo sin publicar la aplicación como *self-contained*, lo que multiplica el
tamaño del artefacto y complica el despliegue.

Lo mismo pasa con casi cualquier plataforma gratuita: las imágenes base de contenedores para
.NET 5 ya no reciben actualizaciones.

**Conclusión: migrar a .NET 8 (LTS) no es opcional, es el requisito de entrada al tier
gratuito.** La buena noticia es que en este proyecto es un trabajo acotado —la sección 5 lo detalla
paso a paso, unas 3–4 horas.

## 4. La decisión de base de datos

Cuatro opciones reales. La tabla compara lo que importa.

| | **A. Azure SQL free** | **B. SQL Server en contenedor** | **C. PostgreSQL gratuito** | **D. SQLite** |
|---|---|---|---|---|
| Reescribir los 6 procedimientos | **No** | **No** | Sí (~950 líneas T-SQL) | Sí, y pasarlos a C# |
| Cambiar la capa `Data` | No | No | Sí (`Npgsql`) | Sí, completa |
| Esfuerzo | **2 h** | **1 h** | 3–5 días | 4–6 días |
| Costo | US$ 0 | US$ 0 | US$ 0 | US$ 0 |
| Arranque en frío | Sí, la base se pausa | No | Depende del proveedor | **No** |
| Demo pública | Sí | No (solo local) | Sí | Sí |
| Riesgo de que cambien los términos | Medio | Ninguno | Medio | Ninguno |
| Qué demuestra en portafolio | Poco | Poco | Modernización real | Modernización real |

### Recomendación: **B para desarrollo + A para la demo pública**

**No son excluyentes: usa las dos.**

**B — SQL Server en Docker** resuelve el desarrollo local y las demos presenciales. Un
`docker compose up` y tienes la aplicación entera funcionando en tu portátil, sin internet,
sin arranques en frío, sin cuentas. Para enseñarle el sistema a alguien sentado a tu lado, es
la mejor opción que existe. Cero coste, cero mantenimiento, cero dependencia de nadie.

**A — Azure SQL en su oferta gratuita** cubre el enlace público que puedes poner en el
currículum. Microsoft ofrece una base de datos gratuita permanente (General Purpose
serverless, con una asignación mensual de vCore-segundos y 32 GB). Conserva el 100 % del
T-SQL: `IIF`, `SCOPE_IDENTITY()`, variables de tipo tabla, `dbo.Split`… todo funciona sin
tocar una línea.

> **Verifica los términos actuales antes de comprometerte.** Las ofertas gratuitas de nube
> cambian. Confirma en la documentación de Azure qué incluye hoy la oferta y —esto es
> importante— **configura el comportamiento al agotar la asignación mensual como
> "auto-pausar" y no como "seguir facturando"**. Es una opción explícita al crear la base.
> Si tu prioridad es no gastar, esa casilla es la que importa.

**El coste de A es el arranque en frío.** La base se pausa tras un periodo de inactividad y
la primera petición tarda en despertarla. Si un cliente abre tu enlace y la pantalla se queda
colgada 40 segundos, la demo ya fracasó. Mitigaciones, de mejor a peor:

1. **Despiértala antes de enseñarla.** Abre el enlace 2 minutos antes de la reunión. Es lo más simple y lo que mejor funciona.
2. Una acción programada de GitHub Actions que haga una petición cada 20 minutos en horario laboral. Gratis, pero consume tu asignación mensual de cómputo.
3. Una pantalla de carga honesta en el frontend: *"Despertando la base de datos, unos segundos…"*. Convierte un fallo en una decisión de arquitectura explicada.

### Por qué descarté C y D (para este caso)

**C — PostgreSQL gratuito** (Neon, Supabase) sería la opción por defecto si empezaras de
cero. Aquí no: los 950 líneas de T-SQL no son portables. El inventario completo de
construcciones específicas de SQL Server está en `03-modelo-de-datos.md`, sección 6. Y hay una
trampa adicional: PostgreSQL pliega a minúsculas los identificadores sin comillas, mientras
la capa `Data` accede a las columnas por nombre exacto (`dr["nIdAlmacen"]`). Habría que
revisar cada uno de esos accesos. Son 3–5 días para ahorrar US$ 0 respecto a la opción A.

**D — SQLite** es la opción técnicamente más elegante: elimina el servidor de base de datos,
la aplicación entera cabe en un contenedor, no hay arranque en frío y no dependes de la
política de precios de nadie. Pero exige llevar toda la lógica de negocio de T-SQL a C#, que
son 4–6 días.

**Reconsidera D si**: quieres que el proyecto demuestre capacidad de modernización, y no solo
que "funciona". Mover la lógica de los procedimientos a servicios de C# con pruebas unitarias
es, con diferencia, el cambio que más elevaría el proyecto como pieza de portafolio. Pero es
un proyecto de una semana, no un ajuste de infraestructura. Está desarrollado en
`09-mejoras-propuestas.md`, M-10.

Ver `10-decisiones.md`, D-01 para el razonamiento completo de esta decisión.

## 5. La decisión de hosting

### Backend

| Opción | Costo | Arranque en frío | Notas |
|---|---|---|---|
| **App Service F1 (Free)** | US$ 0 | ~10–30 s tras 20 min inactivo | 60 min de CPU al día, 1 GB RAM. HTTPS en `*.azurewebsites.net` incluido. **No admite *Always On*** |
| Azure Container Apps | US$ 0 con la asignación gratuita | Configurable a 0 réplicas | Requiere contenerizar. Más moderno |
| Render / Fly.io | US$ 0 en su plan gratuito | Sí | Fuera de Azure; otro proveedor que gestionar |
| App Service B1 | ~US$ 13/mes | No (admite *Always On*) | Si algún día quieres que no duerma |

**Recomendado: App Service F1 (Free).** Es el mismo tipo de recurso que ya conoces, el
despliegue es idéntico al que tenías, y cuesta cero. El arranque en frío es el mismo problema
que el de la base de datos y se resuelve igual: abrir el enlace unos minutos antes.

**Ojo:** un plan F1 solo admite una aplicación. Y si ya tienes un plan S1 vacío, **bórralo**;
crear un F1 no cancela el S1.

### Frontend

| Opción | Costo | Arranque en frío | Notas |
|---|---|---|---|
| **Azure Static Web Apps Free** | US$ 0 | No | Ya lo tenías configurado, con los workflows escritos |
| Cloudflare Pages | US$ 0 | No | Ancho de banda ilimitado, el más rápido |
| GitHub Pages | US$ 0 | No | Requiere ajustar el `base href` si va en subruta |

**Recomendado: quedarte en Static Web Apps.** Ya está configurado y ya es gratis. Solo hay
que borrar el workflow duplicado y arreglar el que queda (sección 6).

Si algún día quieres el sitio fuera de Azure por completo, Cloudflare Pages es un cambio de
15 minutos.

### Arquitectura resultante

```
Usuario
  │
  ├──► Azure Static Web Apps (Free)      Angular 9 compilado         US$ 0
  │         │
  │         └── llamadas HTTPS
  │                 │
  └──────────────► App Service F1 (Free)  API .NET 8                 US$ 0
                            │
                            └──► Azure SQL (oferta gratuita)         US$ 0
                                 serverless, auto-pausa
                                                          ─────────────────
                                                          TOTAL:      US$ 0
```

Y en paralelo, para desarrollo y demos presenciales:

```
docker compose up    →    SQL Server 2022 + API .NET 8 + Angular      US$ 0
```

## 6. Plan de ejecución

### Fase 0 — Higiene (1 hora) · hazlo antes que nada

- [ ] Portal de Azure: inventariar recursos, **borrar cualquier App Service Plan huérfano**.
- [ ] Cambiar las contraseñas de `appsettings.json:11` y `ProductoData.cs:190` si están reutilizadas en otro sitio (`06-hallazgos.md`, S-01).
- [ ] `git init` en los dos proyectos y primer commit **con los secretos ya quitados**.
- [ ] `.gitignore`: añadir `appsettings.Development.json`, `.vs/`, `.sonarqube/`, `node_modules/`, `dist/`, `bin/`, `obj/`.
- [ ] Sacar la cadena de conexión a variable de entorno; dejar un marcador en `appsettings.json`.

```jsonc
// appsettings.json — versionado
{ "ConnectionStrings": { "connectionString": "" } }
```
```bash
# desarrollo local
dotnet user-secrets set "ConnectionStrings:connectionString" "Server=localhost,1433;..."
# App Service: Configuración → Cadenas de conexión, o variable de entorno
```

`Conexion.cs` ya lee de `IConfiguration`, así que **basta con configurar el proveedor de
entorno**: no hay que cambiar la lógica.

### Fase 1 — Base de datos local (1 hora)

Los scripts corregidos ya están listos y **verificados ejecutándose** contra SQL Server 2022.

```bash
docker run -d --name sisgapo-db \
  -e ACCEPT_EULA=Y -e MSSQL_SA_PASSWORD='Sisgapo!Demo2026' -e MSSQL_PID=Express \
  -p 1433:1433 mcr.microsoft.com/mssql/server:2022-latest

docker exec sisgapo-db /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'Sisgapo!Demo2026' -C -Q "CREATE DATABASE DB_SISGAPO"

cd sisgapo-docs/sql
for f in 0*.sql; do
  docker exec -i sisgapo-db /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P 'Sisgapo!Demo2026' -C -d DB_SISGAPO -b < "$f" || break
done
```

Cadena de conexión:
```
Server=localhost,1433;Database=DB_SISGAPO;User ID=sa;Password=Sisgapo!Demo2026;TrustServerCertificate=True
```

Ver `sql/README.md` para las pruebas de humo.

### Fase 2 — Migrar a .NET 8 (3–4 horas)

**2.1 · Cambiar el framework de destino** en los cinco `.csproj`:

```xml
<TargetFramework>net8.0</TargetFramework>
```

**2.2 · Actualizar y limpiar paquetes**

| Acción | Paquete |
|---|---|
| **Eliminar** | `Microsoft.AspNet.WebApi.Cors` 5.2.7 — es de .NET Framework, no hace nada |
| **Eliminar** | `Microsoft.EntityFrameworkCore.SqlServer` y `.Tools` — no se usan (`06-hallazgos.md`, D-09) |
| **Eliminar** | `.config/dotnet-tools.json` — manifiesto de `dotnet-ef`, sin uso |
| **Sustituir** | `System.Data.SqlClient` 4.8.2 → `Microsoft.Data.SqlClient` (resuelve dos CVE) |
| **Sustituir** | `Microsoft.ApplicationBlocks.Data` → eliminarlo (ver 2.3) |
| Actualizar | `Swashbuckle.AspNetCore` 5.6.3 → 6.x |
| Actualizar | `NLog` 4.7.10 → 5.x, **o** sustituirlo por `ILogger<T>` |
| Actualizar | `xunit` y `Microsoft.NET.Test.Sdk` a versiones actuales |

Al cambiar a `Microsoft.Data.SqlClient`, sustituye `using System.Data.SqlClient;` por
`using Microsoft.Data.SqlClient;` en `Conexion.cs`, `UsuarioData.cs` y `ZonaData.cs`.

> **Cambio de comportamiento que te va a morder:** `Microsoft.Data.SqlClient` 4.0+ usa
> `Encrypt=true` por defecto. Contra un SQL Server local con certificado autofirmado, la
> conexión falla hasta que añadas `TrustServerCertificate=True` a la cadena. Contra Azure SQL
> no hace falta: el certificado es válido.

**2.3 · Reescribir `Conexion.cs`** — es el único trabajo de código real de esta fase.

`Microsoft.ApplicationBlocks.Data` es un ensamblado solo para .NET Framework; que funcione
en .NET 8 no está garantizado. Y hay que quitarlo igualmente por lo de `06-hallazgos.md`, D-05
(la consulta de metadatos innecesaria en cada escritura).

Las 253 líneas actuales se reducen a unas 60. Toda la introspección con
`sp_procedure_params_rowset`, `ObtenerParametros()` y `f_obtenerSQLType()` **desaparece**,
porque los seis procedimientos tienen la misma firma:

```csharp
using Microsoft.Data.SqlClient;
using System.Data;

namespace Data
{
    public class Conexion
    {
        private readonly string cadena;

        public Conexion(IConfiguration configuration)
        {
            cadena = configuration.GetConnectionString("connectionString")
                     ?? throw new InvalidOperationException(
                            "Falta la cadena de conexión 'connectionString'.");
        }

        // Lecturas: el reader cierra la conexión al terminar
        public SqlDataReader EjecutarDataReader(string procedimiento, string sOpcion, string pParametro)
        {
            var conn = new SqlConnection(cadena);
            var cmd  = new SqlCommand(procedimiento, conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@sOpcion",    sOpcion);
            cmd.Parameters.AddWithValue("@pParametro", pParametro ?? string.Empty);

            conn.Open();
            return cmd.ExecuteReader(CommandBehavior.CloseConnection);
        }

        // Escrituras: devuelven "cod|mensaje"
        public string EjecutarEscalar(string procedimiento, string sOpcion, string pParametro)
        {
            using var conn = new SqlConnection(cadena);
            using var cmd  = new SqlCommand(procedimiento, conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@sOpcion",    sOpcion);
            cmd.Parameters.AddWithValue("@pParametro", pParametro ?? string.Empty);

            conn.Open();
            return cmd.ExecuteScalar()?.ToString() ?? string.Empty;
        }
    }
}
```

Beneficios inmediatos: menos código, la mitad de viajes a la base de datos, sin dependencias
sin mantenimiento, sin procedimientos de sistema no documentados, y un error claro si falta
la configuración en vez de un `NullReferenceException` tardío.

Nota: pasar a un constructor con `IConfiguration` implica registrar los servicios en el
contenedor de dependencias — es el paso 2.5, y es el momento natural de hacerlo.

**2.4 · Ajustar `Program.cs` / `Startup.cs`**

.NET 8 sigue admitiendo el patrón `Startup` a través de `webBuilder.UseStartup<Startup>()`,
así que **`Program.cs` puede quedarse como está**. Es el camino de menor riesgo.

Si prefieres el hosting mínimo (más idiomático en .NET 8), es una tarde más de trabajo y
queda mejor en un portafolio. Decide con `10-decisiones.md`, D-05.

**2.5 · Añadir inyección de dependencias** (`06-hallazgos.md`, D-03)

```csharp
// Startup.ConfigureServices
services.AddSingleton<Conexion>();
services.AddScoped<AlmacenData>();      services.AddScoped<AlmacenBusiness>();
services.AddScoped<CategoriaData>();    services.AddScoped<CategoriaBusiness>();
services.AddScoped<ProductoData>();     services.AddScoped<ProductoBusiness>();
services.AddScoped<UsuarioData>();      services.AddScoped<UsuarioBusiness>();
services.AddScoped<ZonaData>();         services.AddScoped<ZonaBusiness>();
services.AddScoped<LoginData>();        services.AddScoped<LoginBusiness>();
```

Y cambiar los campos `new X()` por parámetros de constructor. Es mecánico y elimina de paso
el problema de releer `appsettings.json` en cada petición.

**2.6 · CORS por configuración** (`06-hallazgos.md`, S-08)

```csharp
// appsettings.json
"Cors": { "Origins": [ "http://localhost:4200" ] }

// Startup.ConfigureServices
services.AddCors(o => o.AddDefaultPolicy(p => p
    .WithOrigins(Configuration.GetSection("Cors:Origins").Get<string[]>())
    .AllowAnyMethod()
    .AllowAnyHeader()));
```

En App Service se sobrescribe con la variable `Cors__Origins__0`.

**2.7 · Swagger también en producción**

Para una demo, poder enseñar `/swagger` con los endpoints documentados vale mucho. Saca
`UseSwagger()` y `UseSwaggerUI()` del `if (env.IsDevelopment())`.

**2.8 · Configurar el registro** (`06-hallazgos.md`, C-04)

Lo más rápido y lo mejor para contenedores: eliminar NLog y usar `ILogger<T>`, que escribe en
la salida estándar —que es donde App Service y Docker leen los logs—. Son 24 sustituciones
mecánicas de `logger.Error(e)`.

**2.9 · Verificar**

```bash
dotnet build SISGAPO_Back.sln        # 0 errores, y muchos menos warnings
dotnet run --project SISGAPO_API
curl -k -X POST https://localhost:44360/LoginService \
  -H 'Content-Type: application/json' \
  -d '{"sNombreUsuario":"admin","sContrasenia":"123456"}'
```

### Fase 3 — Arreglar los bugs que se ven (2–3 horas)

Estos tres son los que un cliente encuentra en los primeros cinco minutos de probar.

- [ ] **`06-hallazgos.md`, C-02** — editar producto. En `productos-modal.component.ts`, insertar `nIdProducto` en la posición 10 y dejar `nIdCatProd` en la 11. En `USP_MNT_Productos` opción `07`, obtener `@nIdLote` a partir de `@nIdProducto` antes del `UPDATE TBL_LOTE`.
- [ ] **`06-hallazgos.md`, C-03** — editar zona. Añadir una opción `04` (actualizar) a `USP_MNT_Zonas`, un `PUT /api/zona/{id}` en el controller, y hacer que `zona-form` elija entre alta y edición en vez de borrar el id.
- [ ] **`06-hallazgos.md`, C-08** — sustituir `return null` por `BadRequest(...)` en los seis controllers.
- [ ] **`06-hallazgos.md`, D-09** — borrar `WeatherForecast.cs`, `Correo.cs`, `Test/Entities.cs`, el módulo `Cliente` completo y las cinco clases de entidad vacías.

### Fase 4 — Que la demo no dé vergüenza (4–6 horas)

- [ ] **Hashear contraseñas** (S-02). `BCrypt.Net-Next`, columna a `VARCHAR(255)`, verificación en C# en vez de en el `WHERE` del procedimiento, y quitar `sContrasenia` del `SELECT` de la opción `03`.
- [ ] **Autenticación JWT** (S-03). `LoginService` emite un token con el rol como *claim*; `[Authorize]` en los controllers; interceptor HTTP en Angular que añada la cabecera.
- [ ] **Guards de ruta** (S-04). Un `AuthGuard` en `app-routing.module.ts`.
- [ ] **Filtrar el menú y los botones por rol**, que es lo que dice el documento de casos de uso y hoy no se cumple.

Con esto el proyecto deja de ser "una demo universitaria con agujeros" y pasa a ser "un
sistema con autenticación real". Es el salto de percepción más grande por hora invertida.

### Fase 5 — Desplegar (2 horas)

**Base de datos.** Crear la base en Azure SQL con la oferta gratuita, **marcando la opción de
auto-pausar al agotar la asignación** en lugar de seguir facturando. Ejecutar los nueve
scripts de `sql/`. Añadir tu IP a las reglas del firewall y activar "Permitir que los
servicios de Azure accedan al servidor".

**API.** Crear un App Service en un plan **F1 (Free)**, Linux, pila .NET 8. Publicar con
`dotnet publish` + zip deploy, o con GitHub Actions. Configurar en el portal:

```
ConnectionStrings__connectionString = Server=tcp:...;Encrypt=True;...
Cors__Origins__0                    = https://<tu-app>.azurestaticapps.net
```

**Frontend.**

1. Borrar el workflow `blue-sea` (tiene `output_location: dist`, que es incorrecto — ver `05-frontend.md`, sección 9).
2. En el workflow que queda, añadir la versión de Node y el flag de OpenSSL:

```yaml
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: Build And Deploy
        env:
          NODE_OPTIONS: --openssl-legacy-provider
        uses: Azure/static-web-apps-deploy@v1
        with:
          # ...
          output_location: "dist/SISGAPO-Front"
```

3. Actualizar `environment.prod.ts` con **HTTPS** y la URL real del App Service.

**Verificación final:**
- [ ] El frontend carga y el login funciona con `admin` / `123456`
- [ ] Las cinco pantallas listan datos
- [ ] Crear, editar y dar de baja funcionan en cada módulo
- [ ] `/swagger` responde
- [ ] Sin errores de CORS en la consola del navegador
- [ ] Azure → Cost Management muestra **US$ 0** proyectado

## 7. Calendario

| Fase | Duración | Resultado |
|---|---|---|
| 0 · Higiene | 1 h | Sin gasto, sin secretos, bajo control de versiones |
| 1 · Base de datos local | 1 h | Base funcionando en Docker |
| 2 · .NET 8 | 3–4 h | Backend desplegable en tier gratuito |
| 3 · Bugs visibles | 2–3 h | La demo no falla al probarla |
| **Corte mínimo** | **≈ 1 día** | **Demo local completa, US$ 0** |
| 4 · Autenticación real | 4–6 h | Un revisor técnico no pone pegas |
| 5 · Despliegue | 2 h | Enlace público en el currículum |
| **Total** | **≈ 2,5 días** | **Demo pública presentable, US$ 0/mes** |

Si solo tienes un día, haz 0 → 1 → 2 → 3 y enseña la demo desde tu portátil con Docker. Es
una demo perfectamente válida y, para una reunión presencial, **mejor** que un enlace con
arranque en frío.

## 8. Docker Compose

Merece la pena por sí solo: convierte "hay que configurar la base de datos, la cadena de
conexión, Node…" en **un comando**. Para un portafolio, ese detalle vale más que muchas
líneas de código.

`docker-compose.yml` en `c:/proyectos/SISGAPO/`:

```yaml
services:
  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      ACCEPT_EULA: "Y"
      MSSQL_SA_PASSWORD: "Sisgapo!Demo2026"
      MSSQL_PID: "Express"
    ports: ["1433:1433"]
    volumes: ["sisgapo-data:/var/opt/mssql"]
    healthcheck:
      test: ["CMD-SHELL", "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $$MSSQL_SA_PASSWORD -C -Q 'SELECT 1'"]
      interval: 10s
      retries: 12

  api:
    build: ./sisgapo-api
    environment:
      ConnectionStrings__connectionString: "Server=db,1433;Database=DB_SISGAPO;User ID=sa;Password=Sisgapo!Demo2026;TrustServerCertificate=True"
      Cors__Origins__0: "http://localhost:4200"
      ASPNETCORE_ENVIRONMENT: "Development"
    ports: ["5000:8080"]
    depends_on:
      db: { condition: service_healthy }

  web:
    build: ./sisgapo-web
    ports: ["4200:80"]
    depends_on: [api]

volumes:
  sisgapo-data:
```

`sisgapo-api/Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish SISGAPO_API/SISGAPO_API.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "SISGAPO_API.dll"]
```

`sisgapo-web/Dockerfile` — el `ENV NODE_OPTIONS` es imprescindible (ver `05-frontend.md`, sección 1):

```dockerfile
FROM node:18 AS build
WORKDIR /src
ENV NODE_OPTIONS=--openssl-legacy-provider
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npx ng build --prod

FROM nginx:alpine
COPY --from=build /src/dist/SISGAPO-Front /usr/share/nginx/html
```

Con nginx hace falta una regla para que las rutas de Angular funcionen al recargar la página:

```nginx
location / { try_files $uri $uri/ /index.html; }
```

Falta automatizar la carga de los scripts SQL al arrancar el contenedor de base de datos: la
forma habitual es un servicio adicional de un solo uso que espere al *healthcheck* y ejecute
`sqlcmd` sobre los archivos de `sisgapo-docs/sql/`.

## 9. Si prefieres irte de Azure del todo

Combinación gratuita sin Azure, por si la suscripción da problemas:

| Capa | Servicio | Notas |
|---|---|---|
| Frontend | **Cloudflare Pages** | Gratis, sin arranque en frío, ancho de banda ilimitado |
| API | **Fly.io** o **Render** | Ambos con plan gratuito; Render duerme tras 15 min |
| Base de datos | **Neon** (PostgreSQL) | Implica la opción C: reescribir el T-SQL (3–5 días) |

**El problema es la base de datos.** Fuera de Azure no hay SQL Server gratuito gestionado, y
un contenedor de SQL Server necesita ~2 GB de RAM, más de lo que dan los planes gratuitos.

Por eso, si quieres conservar el T-SQL, **Azure es la única vía gratuita**. Si estás dispuesto
a reescribirlo, se abre todo lo demás — y en ese caso conviene ir directamente a SQLite
(opción D), que además elimina el servidor de base de datos.

Ver `10-decisiones.md`, D-02.

## 10. Resumen

1. **Comprueba Azure hoy.** Probablemente ya no pagas; si queda un App Service Plan huérfano, ahí está el gasto.
2. **El App Service S1 era el 94 % del costo**, no la base de datos.
3. **Migrar a .NET 8 es el requisito de entrada**, no una mejora opcional.
4. **Conserva el T-SQL**: Azure SQL gratuito para el enlace público, SQL Server en Docker para desarrollo y demos presenciales.
5. **Un día de trabajo** te deja una demo local completa a US$ 0. **Dos días y medio**, una demo pública.
6. **Docker Compose** es el detalle que más valor aporta por hora invertida en un portafolio.
