# 07 — Infraestructura y costos

Cómo se pasó de ~US$ 78/mes a US$ 0/mes: qué se eligió, por qué, y cómo volver a desplegarlo
si hiciera falta.

> **Estado: ejecutado.** El backend corre en un App Service F1 y el frontend en Static Web
> Apps, ambos gratuitos; el enlace está en el [README](../README.md). Lo que queda aquí es el
> análisis que llevó a esa elección y la receta de despliegue, no una lista de tareas.

## 1. Qué corre hoy

| Capa | Servicio | SKU | Costo |
|---|---|---|---|
| Frontend | Azure Static Web Apps | Free | US$ 0 |
| API | Azure App Service, Linux, .NET 8 | F1 (Free) | US$ 0 |
| Base de datos | Azure SQL | Oferta gratuita, serverless con auto-pausa | US$ 0 |
| Desarrollo y demos presenciales | SQL Server 2022 en Docker | — | US$ 0 |

El despliegue es **manual**: se publica a mano después de comprobar que los dos trabajos de
CI están en verde. No hay entrega continua (`11-estado-portafolio.md`).

Las dos capas gratuitas se duermen tras un rato sin tráfico, así que la primera petición
después de una pausa tarda. Los listados lo enseñan con el componente `app-estado-carga` y su
botón de reintento (`06-hallazgos.md`, C-21); para una demo en vivo, lo que mejor funciona
sigue siendo abrir el enlace un par de minutos antes.

## 2. De dónde venía el costo

| Recurso | SKU | Precio de lista (East US) | % del total |
|---|---|---|---|
| App Service Plan | **S1 Standard** | ~US$ 73/mes | **94 %** |
| Azure SQL Database | Basic, 5 DTU, 2 GB | ~US$ 5/mes | 6 % |
| Azure Static Web Apps | Free | US$ 0 | 0 % |
| **Total** | | **~US$ 78/mes** | |

**La base de datos nunca fue el problema.** El 94 % del gasto era un App Service Plan
Standard S1 para servir una API que atiende, como mucho, a una persona enseñando una demo.
Un S1 da 100 ACU, 1,75 GB de RAM y ranuras de despliegue: nada de eso hacía falta aquí.

Un detalle que vale por todo el documento: **un App Service Plan factura aunque no tenga
ninguna aplicación dentro.** Es el error de facturación más común en Azure, y conviene
comprobarlo antes que ninguna otra cosa.

## 3. El requisito de entrada: salir de .NET 5

.NET 5 lleva fuera de soporte desde mayo de 2022 y Azure App Service ya no lo ofrece como
pila de runtime. No es solo que sea inseguro: **no se puede desplegar** en un App Service
nuevo sin publicar la aplicación como *self-contained*. Lo mismo pasa en casi cualquier
plataforma gratuita.

Por eso migrar a .NET 8 (LTS) no fue una mejora opcional sino la condición de entrada al
tier gratuito. Hecho y verificado: `06-hallazgos.md`, D-01.

## 4. La decisión de base de datos

Cuatro opciones reales. La tabla compara lo que importa.

| | **A. Azure SQL free** | **B. SQL Server en contenedor** | **C. PostgreSQL gratuito** | **D. SQLite** |
|---|---|---|---|---|
| Reescribir los procedimientos | **No** | **No** | Sí (~950 líneas T-SQL) | Sí, y pasarlos a C# |
| Cambiar la capa `Data` | No | No | Sí (`Npgsql`) | Sí, completa |
| Esfuerzo | **2 h** | **1 h** | 3–5 días | 4–6 días |
| Costo | US$ 0 | US$ 0 | US$ 0 | US$ 0 |
| Arranque en frío | Sí, la base se pausa | No | Depende del proveedor | **No** |
| Demo pública | Sí | No (solo local) | Sí | Sí |
| Riesgo de que cambien los términos | Medio | Ninguno | Medio | Ninguno |
| Qué demuestra en portafolio | Poco | Poco | Modernización real | Modernización real |

**Se eligieron A y B, que no son excluyentes.** B —SQL Server en Docker— resuelve el
desarrollo y las demos presenciales: `docker compose up` y el sistema entero funciona sin
internet, sin cuentas y sin arranques en frío. A —Azure SQL en su oferta gratuita— cubre el
enlace público, y conserva el 100 % del T-SQL: `IIF`, `SCOPE_IDENTITY()`, variables de tipo
tabla, `dbo.Split`, todo funciona sin tocar una línea.

> **Al crear la base, el ajuste que importa** es el comportamiento al agotar la asignación
> mensual: **auto-pausar**, no seguir facturando. Es una casilla explícita en el portal, y es
> la diferencia entre una demo gratuita y una factura sorpresa. Los términos de las ofertas
> gratuitas cambian; conviene confirmarlos antes de comprometerse.

**Por qué se descartaron C y D.** PostgreSQL gratuito (Neon, Supabase) sería la opción por
defecto si el proyecto empezara de cero, pero las ~950 líneas de T-SQL no son portables
—el inventario de construcciones específicas de SQL Server está en `03-modelo-de-datos.md`,
sección 6— y hay una trampa extra: PostgreSQL pliega a minúsculas los identificadores sin
comillas, mientras la capa `Data` lee las columnas por nombre exacto (`dr["nIdAlmacen"]`).
Son 3–5 días para ahorrar US$ 0 frente a la opción A.

SQLite es la opción técnicamente más elegante —sin servidor de base de datos, sin arranque en
frío, sin depender de la política de precios de nadie—, pero exige llevar toda la lógica de
negocio de T-SQL a C#: 4–6 días. **Reconsidérala si** el objetivo pasa a ser demostrar
capacidad de modernización y no solo que el sistema funciona; está desarrollada en
`09-mejoras-propuestas.md`, M-10.

Ver `10-decisiones.md`, D-01 para el razonamiento completo.

## 5. La decisión de hosting

### Backend

| Opción | Costo | Arranque en frío | Notas |
|---|---|---|---|
| **App Service F1 (Free)** | US$ 0 | ~10–30 s tras 20 min inactivo | 60 min de CPU al día, 1 GB RAM. HTTPS en `*.azurewebsites.net` incluido. **No admite *Always On*** |
| Azure Container Apps | US$ 0 con la asignación gratuita | Configurable a 0 réplicas | Requiere contenerizar. Más moderno |
| Render / Fly.io | US$ 0 en su plan gratuito | Sí | Fuera de Azure; otro proveedor que gestionar |
| App Service B1 | ~US$ 13/mes | No (admite *Always On*) | Si algún día se quiere que no duerma |

**Elegido: App Service F1.** Mismo tipo de recurso que ya se conocía, despliegue idéntico al
que había, coste cero. Un plan F1 solo admite una aplicación, y crear uno **no cancela** un
S1 anterior: hay que borrarlo aparte.

### Frontend

| Opción | Costo | Arranque en frío | Notas |
|---|---|---|---|
| **Azure Static Web Apps Free** | US$ 0 | No | Ya estaba configurado, con los workflows escritos |
| Cloudflare Pages | US$ 0 | No | Ancho de banda ilimitado, el más rápido |
| GitHub Pages | US$ 0 | No | Requiere ajustar el `base href` si va en subruta |

**Elegido: seguir en Static Web Apps**, porque ya estaba configurado y ya era gratis. Mudarse
a Cloudflare Pages sería un cambio de 15 minutos si algún día conviene.

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

Y en paralelo, para desarrollo y demos presenciales: `docker compose up`.

## 6. Cómo se ejecutó

| Fase | Qué se hizo | Dónde está hoy |
|---|---|---|
| Higiene | Borrar recursos huérfanos, sacar la cadena de conexión y la clave JWT a variables de entorno | `06-hallazgos.md`, S-01, S-10 |
| Base de datos local | Los doce scripts de `sql/` reejecutables, cargados por `docker compose up db-init` | `03-modelo-de-datos.md`, `sql/README.md` |
| .NET 8 | Migración desde .NET 5, 0 avisos, `Microsoft.Data.SqlClient` en vez de la dependencia con CVE | `06-hallazgos.md`, D-01, S-05, S-06 |
| Bugs visibles | Los que un cliente encuentra en los primeros cinco minutos | `06-hallazgos.md`, C-02, C-03, C-08, D-09 |
| Autenticación real | bcrypt, JWT con el rol como *claim*, `[Authorize]`, guards por rol y menú filtrado | `06-hallazgos.md`, S-02 a S-04 |
| Despliegue | App Service F1 + Static Web Apps + Azure SQL gratuito | Sección 7 |

## 7. Cómo repetir el despliegue

**Base de datos.** Crear la base en Azure SQL con la oferta gratuita, **marcando la opción de
auto-pausar** al agotar la asignación. Añadir la IP propia al firewall y activar «Permitir que
los servicios de Azure accedan al servidor». Después, cargar esquema y datos:

```powershell
cd sisgapo-docs/sql
.\cargar-base.ps1 -Servidor <servidor>.database.windows.net -Base <base> -Usuario <admin>
```

Dos avisos: hay que lanzarlo **desde PowerShell**, no desde `cmd`; y `-Base` es obligatorio
salvo que la base se llame `DB_SISGAPO`. El script no se edita —servidor y usuario van por
parámetro, la contraseña se pide por consola— y solo pasa los doce archivos `01`–`12` por
`sqlcmd`, en orden. Vale igual para Azure SQL, para Docker y para un SQL Server instalado.

La base hay que crearla a mano: los scripts no llevan `CREATE DATABASE` porque Azure SQL no
lo admite dentro de una conexión a otra base. **No hay migraciones**, así que este paso es
obligatorio una vez por base. Verificar con los conteos que imprime `03-seed.sql`
(ver `sql/README.md`).

**API.** App Service en plan **F1**, Linux, pila .NET 8. Publicar con `dotnet publish` + zip
deploy, o con GitHub Actions. Después, en **Configuración → Configuración de la aplicación**,
estas cinco. Van todas ahí, como *application settings*: la hoja «Cadenas de conexión»
**no sirve**, porque Azure la expone con el prefijo `SQLAZURECONNSTR_` y `ConfiguracionBD` no
lee ese proveedor.

| Nombre | Valor | Por qué |
|---|---|---|
| `SISGAPO_CONNECTION_STRING` | `Server=tcp:<servidor>.database.windows.net,1433;Initial Catalog=<base>;User ID=<admin>;Password=<clave>;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;` | Es la primera que consulta `ConfiguracionBD`. Sin ella, fuera de `Development` la API no arranca |
| `SISGAPO_JWT_KEY` | 32 caracteres o más, al azar | Firma los tokens. `ConfiguracionJwt` rechaza claves más cortas con un mensaje explícito |
| `Cors__OrigenesPermitidos__0` | `https://<tu-app>.azurestaticapps.net` | Sobrescribe el `localhost:4200` de `appsettings.json`. Sin barra final y con el esquema |
| `Demo__SoloLectura` | `false`, o sin definir | Las escrituras quedan **abiertas** a propósito: crear un producto o registrar un movimiento es lo que hace útil la demo. Ponerla en `true` solo para cerrarla puntualmente (`06-hallazgos.md`, S-11) |
| `ASPNETCORE_ENVIRONMENT` | `Production` | Redundante —es el valor por defecto— pero deja explícito que `appsettings.Development.json` no se carga |

Dos detalles que cuestan una tarde si se pasan por alto:

- La clave de CORS es `OrigenesPermitidos`, no `Origins`. Para más de un origen se añaden
  `Cors__OrigenesPermitidos__1`, `__2`… El índice `0` **sustituye** al del JSON, no se suma.
- El doble guion bajo `__` es el separador de niveles de configuración en Linux. En Windows
  también funciona.

Opcionales: `Jwt__MinutosVigencia` (480 por defecto) y `Jwt__Emisor` / `Jwt__Audiencia`
(`SISGAPO` los dos).

**Frontend.** El workflow de Static Web Apps necesita la versión de Node y el flag de
OpenSSL, y `output_location: "dist/SISGAPO-Front"`:

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

Y `environment.prod.ts` apunta al App Service por **HTTPS** (`05-frontend.md`, sección 9).

**Verificación final:**

- [ ] Los acentos llegaron bien: `SELECT COUNT(*) FROM TBL_ALMACEN WHERE sNombre LIKE '%Ã%';` da 0
- [ ] El frontend carga y los tres botones de cuenta de la pantalla de acceso entran
- [ ] Los seis listados traen datos
- [ ] Crear, editar y dar de baja funcionan en cada módulo
- [ ] Sin errores de CORS en la consola del navegador
- [ ] Azure → Cost Management muestra **US$ 0** proyectado

## 8. Entorno local con Docker

`docker-compose.yml`, en la raíz del repositorio, levanta SQL Server 2022 y carga esquema y
datos con el servicio `db-init`, que espera al *healthcheck* y pasa los doce archivos de
`sisgapo-docs/sql/` por `sqlcmd`. Los comandos están documentados en la cabecera del propio
archivo y en `sql/README.md`.

Convierte «hay que configurar la base de datos, la cadena de conexión, Node…» en un comando.
Para un portafolio, ese detalle vale más que muchas líneas de código.

## 9. Si prefieres irte de Azure del todo

Combinación gratuita sin Azure, por si la suscripción da problemas:

| Capa | Servicio | Notas |
|---|---|---|
| Frontend | **Cloudflare Pages** | Gratis, sin arranque en frío, ancho de banda ilimitado |
| API | **Fly.io** o **Render** | Ambos con plan gratuito; Render duerme tras 15 min |
| Base de datos | **Neon** (PostgreSQL) | Implica la opción C: reescribir el T-SQL (3–5 días) |

**El problema es la base de datos.** Fuera de Azure no hay SQL Server gratuito gestionado, y
un contenedor de SQL Server necesita ~2 GB de RAM, más de lo que dan los planes gratuitos.

Por eso, para conservar el T-SQL, **Azure es la única vía gratuita**. Si se acepta
reescribirlo, se abre todo lo demás — y en ese caso conviene ir directamente a SQLite
(opción D), que además elimina el servidor de base de datos.

Ver `10-decisiones.md`, D-02.

## 10. Resumen

1. **El App Service S1 era el 94 % del costo**, no la base de datos. Y un plan sin
   aplicaciones dentro sigue facturando.
2. **Migrar a .NET 8 fue el requisito de entrada** al tier gratuito, no una mejora opcional.
3. **Se conservó el T-SQL**: Azure SQL gratuito para el enlace público, SQL Server en Docker
   para desarrollo y demos presenciales.
4. **El arranque en frío es el precio del tier gratuito.** Se paga con un aviso honesto en la
   interfaz y abriendo el enlace antes de enseñarlo, no con dinero.
5. **US$ 0/mes, y el enlace público funciona.**
