# Auditoría de cierre — octubre de 2026

> **Histórico.** Es la auditoría con la que se cerró la demo, con las correcciones del 2 y del
> 4 de octubre de 2026, y se conserva tal como quedó. Lo que sigue abierto —H-04, H-07, H-12 a
> H-16 y las mejoras MC— se mantiene, con los mismos identificadores, en
> [`../11-auditoria-y-cierre.md`](../11-auditoria-y-cierre.md). Las rutas que cita son las de
> `sisgapo-docs/`.

Revisión completa de código y documentación hecha el **1 de octubre de 2026** para dar el
proyecto por cerrado como demo de portafolio. Sustituyó como documento vivo a la auditoría
de agosto–septiembre, cuyos 48 hallazgos están todos cerrados y viven en
[`hallazgos-2026.md`](hallazgos-2026.md).

Tres reglas de esta pasada:

1. Los hallazgos describen la fotografía encontrada el 1 de octubre. El bloque necesario
   para cerrar la demo se aplicó al día siguiente y se distingue como **cerrado**; el resto
   conserva su propuesta para una posible reapertura.
2. Los identificadores son nuevos —`H-` hallazgos, `MC-` mejoras de código, `R-`
   recomendaciones— para no chocar con los `S-`/`C-`/`D-` del histórico.
3. La gravedad mide lo que pesa **para una demo que se cierra**, no para un sistema en
   producción: 🔴 hay que hacerlo antes de archivar, 🟠 un revisor lo nota o afecta a la
   demo pública, 🟡 conviene, pero el proyecto se puede cerrar sin ello.

## 1. Alcance y método

| Qué se revisó | Cómo |
|---|---|
| Backend: 7 controladores, 9 clases `Business`, 9 `Data` con sus interfaces, `Entity`, `Seguridad`, `Startup`, configuración y pruebas (4 811 líneas de C#) | Lectura completa, compilación y ejecución de la suite |
| Base de datos: los 12 scripts de `sql/` (2 710 líneas de T-SQL) | Lectura completa; cruce de cada opción con la capa `Data` y con el servicio Angular que la llama |
| Frontend: 19 componentes, 9 servicios, guard, interceptor y modelos (3 984 líneas de TypeScript sin pruebas; 761 de `.spec.ts`) | Lectura completa y build de producción |
| Infraestructura: `docker-compose.yml`, `init-db.sh`, `cargar-base.ps1`, el workflow de CI, el despliegue público | Ejecución local y peticiones HTTP a la instancia pública |
| Documentación: los doce documentos y los dos README | Cada afirmación contrastada con el código de hoy |
| Decisiones D-01 a D-47 | Revisadas una por una; el resultado está en `09-decisiones.md`, «Revisión del 1 de octubre de 2026» |
| Dependencias | `dotnet list package --vulnerable --include-transitive`, `--outdated`, `npm audit --omit=dev` |

## 2. Estado verificado el 1 de octubre de 2026

| Comprobación | Resultado |
|---|---|
| `dotnet build SISGAPO_Back.sln -c Release` | **0 avisos, 0 errores**, proyecto en `net10.0` con SDK 10.0.400 |
| `dotnet test` sin base de datos | **26 unitarias en verde**, 13 de integración omitidas: Docker no estaba levantado. La nueva prueba cubre la baja de productos con existencia |
| `npm run build` (Node 24.19) | Compila: `main` 1,01 MB, `styles` 123 kB, 15,7 s |
| GitHub Actions | Las cinco últimas ejecuciones en verde; la última, el 9 de septiembre (`a56ce16`) |
| Demo pública | Frontend responde `200` en 1 s. La API responde `200` en **18 s** en frío (`/ConfiguracionService`, que no toca la base). `/swagger` → `404`, como está configurado |
| Secretos | Ninguno en el árbol ni en los 251 archivos versionados. En el clon hay una nota local con datos de conexión, `cred.fake`, que Git ignora (ver R-07) |
| Paquetes NuGet vulnerables | **Ninguno**, incluido el análisis transitivo, después de actualizar a .NET 10 y `Microsoft.Data.SqlClient` 7.1.1 |
| Paquetes NuGet atrasados | Los paquetes directos del backend quedaron actualizados el 2 de octubre. Ver H-03 |
| `npm audit --omit=dev` | 23 avisos (2 críticos, 10 altos, 9 moderados, 2 bajos), todos en dependencias de compilación de Angular 9. Ver H-04 |
| Repositorio | Público, rama `main`, 123 commits, árbol limpio al empezar |

**Conclusión de la verificación:** el sistema funcionaba donde la documentación de
septiembre decía que estaba. El 2 de octubre se aplicó el bloque de cierre descrito en
H-01 a H-03 y H-08 a H-10.

## 3. Hallazgos

### Seguridad y mantenimiento

#### ✅ H-01 · .NET 8 sale de soporte el 10 de noviembre de 2026 — cerrado

`sisgapo-api/*/*.csproj`, `.github/workflows/ci.yml`

.NET 8 es LTS y su soporte termina el 10 de noviembre de 2026; .NET 9 termina el mismo
día. A partir de ahí no hay parches de seguridad para el runtime ni para los paquetes
`Microsoft.AspNetCore.*` de la rama 8. Un repositorio que se presenta como «puesto a
punto en 2026» con un runtime sin soporte pierde justo el argumento que lo sostiene.

**Aplicado el 2 de octubre:** migración a **.NET 10**, LTS con soporte hasta noviembre de 2028. El SDK 10
ya está instalado en la máquina de desarrollo (`dotnet --version` → `10.0.400`). Es el
mismo tipo de cambio mecánico que D-25 documentó para pasar de .NET 5 a 8:

- cinco `<TargetFramework>net8.0</TargetFramework>` → `net10.0`;
- paquetes a su rama 10: `Microsoft.AspNetCore.Authentication.JwtBearer`,
  `Microsoft.Extensions.Configuration` y `.Json`, `Microsoft.NET.Test.Sdk`,
  `coverlet.collector`;
- `dotnet-version: 10.0.x` en los dos trabajos del workflow;
- al ejecutar la migración del documento 10, la imagen base del `Dockerfile`.

Verificación: compilar sin avisos, 39 pruebas en verde con `docker compose`, y el
recorrido por HTTP de D-41. **Esfuerzo:** 2–3 h. Decisión registrada como D-50.

#### ✅ H-02 · Un paquete transitivo con vulnerabilidad alta que CI no ve — cerrado

`sisgapo-api/Data/Data.csproj`

`Microsoft.Data.SqlClient 5.1.6` arrastra `System.Formats.Asn1 5.0.0`, afectado por
GHSA-447r-wph3-92pm (denegación de servicio al analizar ASN.1). Aparece en los cuatro
proyectos porque todos dependen de `Data`.

CI no lo avisa: con el SDK 8 la auditoría de NuGet solo cubre los paquetes directos. En
local, con el SDK 10, tampoco salió en el `build` porque la restauración estaba al día y
el aviso solo se emite al restaurar.

**Aplicado:** `Microsoft.Data.SqlClient` subió a 7.1.1 y
`dotnet list package --vulnerable --include-transitive` queda vacío. Ojo con el cambio de
comportamiento ya conocido: el cifrado va activado por defecto y la cadena local necesita
`TrustServerCertificate=True`, que ya lleva. **Esfuerzo:** 30 min, junto con H-01.

#### ✅ H-03 · Paquetes directos atrasados — cerrado

| Paquete | Hoy | Última | Nota |
|---|---|---|---|
| `Microsoft.AspNetCore.Authentication.JwtBearer` | 10.0.12 | 10.0.12 | Actualizado con el runtime |
| `Microsoft.Data.SqlClient` | 7.1.1 | 7.1.1 | Ver H-02 |
| `NLog` | 6.2.1 | 6.2.1 | `nlog.config` conservado y build sin avisos |
| `Swashbuckle.AspNetCore` | 10.2.3 | 10.2.3 | `AddSecurityRequirement` adaptado a OpenAPI 2.x |
| `BCrypt.Net-Next` | 4.2.0 | 4.2.0 | Compatible |
| `Microsoft.NET.Test.Sdk`, `xunit.runner.visualstudio`, `coverlet.collector` | 18.10 / 4.0 / 10.1 | 18.10 / 4.0 / 10.1 | Solo pruebas |

**Aplicado:** paquetes directos actualizados en la misma tanda que H-01, con compilación
sin avisos y la suite como red.

#### 🟡 H-04 · `npm audit` devuelve 23 avisos, ninguno en el bundle

`sisgapo-web/package-lock.json`

Los 23 avisos de `npm audit --omit=dev` —`minimist` (crítico, contaminación de
prototipos), `semver` y `minimatch` (ReDoS) entre ellos— están en herramientas de
compilación que Angular 9 arrastra, no en código que llegue al navegador. Afectan a la
máquina que compila, no al visitante. Pero es lo primero que ejecuta un revisor que clona
el repositorio, y 23 avisos con dos críticos no se explican solos.

**Propuesta:** `npm audit fix` sin `--force` y, para lo que quede, `overrides` selectivos
en `package.json` como ya se hizo con `websocket-driver` (D-39); comprobar `npm run build`
después de cada uno. Lo que no se pueda subir sin romper Webpack 4 es coste de D-47 y
conviene decirlo en el README en una línea. **Esfuerzo:** 1–2 h.

#### ✅ H-05 · El límite de intentos de acceso depende de la IP de conexión — cerrado

`sisgapo-api/SISGAPO_API/Startup.cs`, política `Login`

El limitador particiona por `Connection.RemoteIpAddress`. Detrás de un proxy inverso que
no reenvíe cabeceras, esa IP es la del proxy para todas las personas: cinco intentos
fallidos de cualquiera bloquean el acceso de todas durante un minuto. En App Service la
plataforma activa el reenvío por su cuenta (`ASPNETCORE_FORWARDEDHEADERS_ENABLED`), así
que hoy funciona; en un VPS con nginx, Apache o Caddy delante (documento 10) deja de
funcionar en silencio.

**Propuesta:** definir `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true` en el entorno del
contenedor —o `app.UseForwardedHeaders` en `Startup` con los proxies conocidos— y dejar
escrita la comprobación: seis intentos fallidos desde una red no deben bloquear a otra.
**Esfuerzo:** 15 min; es condición de la migración, no de hoy.

**Cerrado el 4 de octubre de 2026** con la migración: `ASPNETCORE_FORWARDEDHEADERS_ENABLED`
en `deploy/compose.yaml`. Comprobado en producción: seis intentos fallidos desde una IP
devuelven 429 a esa IP y no a otra, y una `X-Forwarded-For` inventada no cambia la cuenta.

#### ✅ H-06 · Swagger apagado en producción, pero en el guion de la demo — cerrado por decisión

`Startup.Configure` solo registra Swagger en `Development`; verificado hoy, `/swagger`
responde `404` en la instancia pública. `07-plan-demo.md` lo lista como la sexta pieza
que enseñar y el histórico lo anota como punto a favor de la seguridad. Las dos cosas no
pueden ser verdad a la vez.

**Decisión:** se mantiene solo en desarrollo. El guion lo presenta expresamente como una
pieza para la demostración local y no promete una ruta pública.

#### 🟡 H-07 · Los `CATCH` de los procedimientos devuelven el error de SQL al cliente

`sql/07-usp-productos.sql` (06, 07), `sql/11-usp-lotes.sql` (03, 04),
`sql/12-usp-movimientos.sql` (02)

Las transacciones nuevas terminan con `SELECT CONCAT('0|No se pudo …: ', ERROR_MESSAGE())`.
Ese texto llega tal cual a SweetAlert2: nombres de restricciones, columnas y tipos. Es la
misma clase de fuga que C-19 cerró en `CategoriaData`, reabierta en el otro extremo.

**Propuesta:** devolver un mensaje fijo y relanzar con `THROW`, para que el middleware
registre el detalle en el servidor y responda el `{cod, mensaje}` genérico, como hace ya
`USP_MNT_Usuarios` opción 04. **Esfuerzo:** 30 min.

### Correctitud

#### ✅ H-08 · Dar de baja un producto no mira sus existencias; dar de baja un lote, sí — cerrado

`sql/07-usp-productos.sql` opción 08; `sql/11-usp-lotes.sql` opción 05

`USP_MNT_Lotes` rechaza la baja de un lote con existencia («registra la salida antes»),
pero `USP_MNT_Productos` 08 desactiva el producto con un `UPDATE` sin condiciones. El
resultado es incoherente: los lotes siguen activos y con saldo, pero el panel, el valor
del inventario y el listado de productos activos dejan de contarlos. Y `USP_MNT_Movimientos`
02 solo comprueba el estado del lote, así que por la API todavía se puede mover mercadería
de un producto dado de baja.

Con el seed no se nota porque los cuatro productos de baja tienen lotes vencidos y sin
rotación. Se nota en cuanto alguien desactiva «Café Orgánico Tostado Medio» en la demo.

**Aplicado:** la opción 08 usa la misma regla que D-35 puso en almacenes y
categorías —`0|El producto tiene N en existencia…` si la suma de sus lotes activos es
mayor que cero— y añadir el caso a `InventarioIntegracionTests`. **Esfuerzo:** 30 min.

#### ✅ H-09 · El reintento de conexión no cubre Usuarios ni Zonas — cerrado

`sisgapo-api/Data/UsuarioData.cs`, `sisgapo-api/Data/ZonaData.cs`

El commit `a56ce16` añadió a `Conexion.fnAbrirConexionAsync` dos reintentos (3 s y 6 s)
para cuando Azure SQL sale de la auto-pausa. Pero `UsuarioData` y `ZonaData` no pasan por
`Conexion`: abren su propia `SqlConnection` (la «segunda ruta» que describe
`02-arquitectura.md`, sección 5) y fallan a la primera. Son justo dos pantallas del
recorrido del Administrador en la demo pública; el visitante ve el aviso de error y el
botón *Reintentar* (C-21), que funciona, pero el arreglo declarado está a medias.

**Aplicado:** las dos clases abren ahora la conexión mediante
`Conexion.fnAbrirConexionAsync`, por lo que comparten los reintentos y desaparece la
duplicación de `ConfConexion()`.

#### ✅ H-10 · Si falla la primera llamada de configuración, la interfaz se queda en modo consulta — cerrado

`sisgapo-web/src/app/shared/services/configuracion.service.ts`

`bDemoSoloLectura` arranca en `true`, el `catch` lo deja en `true` y `bCargada` impide
volver a preguntar. Si la petición a `/ConfiguracionService` falla —cosa que pasa en un
arranque en frío que se corta—, la barra muestra «Demo pública en modo consulta» y los
botones de alta y edición desaparecen aunque la API acepte escrituras, hasta que se
recargue la página.

**Aplicado:** arranca en `false` —la barrera real es el filtro de la API, no el botón— y
solo marca la configuración como cargada cuando la petición termina bien; si falla,
reintenta en la siguiente navegación.

#### ✅ H-11 · La ruta `login` carga la barra de navegación dentro de la barra de navegación — corregido

`sisgapo-web/src/app/app-routing.module.ts`, `nav-menu.component.html`

`AppComponent` renderiza `<app-nav-menu>`, y la ruta `login` también apunta a
`NavMenuComponent`. Sin sesión no se nota: el componente exterior pinta el formulario y no
hay `router-outlet`. Con sesión abierta, escribir `/login` en la barra de direcciones
pinta un segundo `NavMenuComponent` —con su propia barra superior y su menú— dentro del
`router-outlet` del primero. Está confirmado leyendo las plantillas; no se reprodujo en
navegador.

**Propuesta:** que la ruta `login` cargue `LoginComponent` con un guard inverso que
redirija a `/inicio` cuando ya hay sesión, y que `NavMenuComponent` deje de decidir entre
formulario y barra. **Esfuerzo:** 1 h; es el «patrón poco habitual» que
`05-frontend.md` describe en la sección 3.

**Corregido el 4 de octubre de 2026**, por otro camino que el propuesto: la ruta `login` ya no
tiene componente y el menú del shell vuelve a leer la sesión en cada navegación. Eso cubre
también el 401 del interceptor, que cerraba la sesión sin avisar al menú y dejaba la barra
encima del formulario. Con sesión, `/login` lleva a `/inicio`. Esta vez sí se reprodujo en el
navegador, en la demo pública.

#### 🟡 H-12 · Usuarios responde `{ mensaje: "OK" }` y, cuando falla, `{ mensaje: "" }`

`sisgapo-api/Data/UsuarioData.cs`, `UsuarioController.cs`, `sql/08-usp-usuarios.sql`

Es la excepción documentada en `04-api-referencia.md`: el único módulo que no devuelve
`{cod, mensaje}`. El coste práctico: editar o dar de baja un id que no existe afecta a
cero filas, la capa `Data` devuelve cadena vacía y el modal muestra «No se pudo guardar»
sin motivo. Y el procedimiento no puede explicar nada porque no tiene por dónde.

**Propuesta:** que `USP_MNT_Usuarios` 04, 05 y 06 terminen con `SELECT '1|…'` o `'0|…'`
como los demás, que `UsuarioData` use `fnEjecutarEscalarAsync`, y que el controlador parta
la respuesta. El frontend cambia dos comparaciones (`respuesta.mensaje === 'OK'` →
`respuesta.cod === '1'`). **Esfuerzo:** 1 h, tres capas a la vez.

#### 🟡 H-13 · La edición de un usuario no va en transacción

`sql/08-usp-usuarios.sql` opción 05

La opción 04 (alta) envuelve sus dos `INSERT` en `BEGIN TRY / BEGIN TRANSACTION` desde
C-07; la 05 (edición) hace el `UPDATE` de `TBL_USUARIO` y, si llega contraseña, el de
`TBL_LOGIN`, sin transacción. **Propuesta:** el mismo bloque que la 04. **Esfuerzo:**
10 min.

#### 🟡 H-14 · Almacenes no valida el rol del supervisor ni el nombre repetido

`sql/05-usp-almacenes.sql` opciones 05 y 06

`03-modelo-de-datos.md` lo dice desde agosto («nada impide asignar un administrador como
supervisor mediante una llamada directa a la API»), pero nunca entró en el inventario de
hallazgos. Tampoco hay comprobación de nombre duplicado, que sí tienen zonas y
categorías. **Propuesta:** dos `IF EXISTS` con respuesta `0|…`, como en
`USP_MNT_Categorias`. **Esfuerzo:** 30 min.

#### 🟡 H-15 · El número de documento no es único

`sql/01-esquema.sql`, `TBL_USUARIO.sNumDoc`

Se pueden dar de alta dos personas con el mismo DNI. En un sistema real sería una
restricción `UNIQUE`; en la demo, un dato más que un revisor puede probar en treinta
segundos. **Propuesta:** `UNIQUE (nTipoDoc, sNumDoc)` en el esquema y el mensaje `0|…`
correspondiente en la opción 04 —hoy el `THROW` del `CATCH` lo convertiría en un 500
genérico—. **Esfuerzo:** 15 min; el seed ya cumple la regla.

#### 🟡 H-16 · Las cantidades son enteras

`TBL_DET_PRODUCTO.nCantidad INT`, `TBL_MOVIMIENTO.nCantidad INT`, y `int` en las entidades

No se puede registrar una salida de 12,5 kg. El seed lo esquiva midiendo la vainilla en
gramos. Es una limitación del modelo de 2021 que los módulos nuevos heredaron a propósito
para no cambiar cuatro capas. **Propuesta:** `DECIMAL(12,3)` en esquema, en los tres
procedimientos que mueven cantidades, en `Entity`, en `Data` y en los dos formularios.
Es un cambio de modelo, no un arreglo: **para la demo, no hacerlo**; queda anotado por si
el proyecto se reabre.

## 4. Mejoras de código propuestas

Nada de esto es un defecto visible. Son las cosas que un revisor que lea el código
anotaría, ordenadas por lo que más aportan por hora. Ninguna está aplicada.

| # | Mejora | Dónde | Esfuerzo |
|---|---|---|---|
| MC-01 | **Un solo catálogo de opciones de escritura.** Hoy «qué `sOpcion` escribe» está declarado tres veces: en el chequeo de rol de cada controlador, en el `bEscritura` de cada `Business` y en `DemoSoloLecturaFilter`. Si una entidad gana una opción, hay que acordarse de tres sitios | `Controllers/*`, `Business/*`, `Seguridad/DemoSoloLecturaFilter.cs` | 2 h |
| MC-02 | **Registrar cada excepción una vez.** `Data`, `Business`, el controlador y el middleware hacen `logger.Error` sobre la misma excepción: cuatro entradas por fallo. Quitar los `try/catch/log/throw` de las tres capas y dejar el middleware. Cambia la convención de `00-convenciones.md`, sección 8, así que es una decisión | las tres capas | 1 h |
| MC-03 | **Configuración inyectada.** `ConfiguracionBD` y `ConfiguracionJwt` construyen su propia `IConfiguration` estática y leen `appsettings` por su cuenta; las pruebas no pueden sustituirlas. Pasar a `IConfiguration`/`IOptions` y registrar `Conexion` en el contenedor en vez de `new Conexion(1)` en nueve constructores | `Data/ConfiguracionBD.cs`, `Seguridad/ConfiguracionJwt.cs`, `Data/*Data.cs` | 2 h |
| MC-04 | **Quitar los constructores sin parámetros de `Business`** (`: this(new XData())`). Mantienen viva la ruta `new` que D-43 cerró; solo los usa una prueba de `PoliticaMovimientoTests`, que puede construir el controlador con dobles | `Business/*.cs`, `Test/PoliticaMovimientoTests.cs` | 30 min |
| MC-05 | **Restos.** `using System.Net; using System.Net.Mail;` en `ProductoData`; `using Microsoft.AspNetCore.Cors;` y el comentario `//using System.Web.Http.Cors;` en `InventarioController`; `#region Almacen` encabezando `CrudProductos`; los comentarios `// fnServAlmacenes`; `ConfConexion()` en `UsuarioData` y `ZonaData`, que solo copian una propiedad estática. Y dos restos fuera del código: `sisgapo-web/.github/workflows/azure-static-web-apps-yellow-meadow-0e36f1a10.yml`, un workflow de 2021 que GitHub no ejecuta desde esa ruta y que apunta a un recurso que ya no existe; y las plantillas ARM de 2021 en `SISGAPO_API/Properties/ServiceDependencies/`, versionadas bajo una ruta que `.gitignore` excluye: o se declaran evidencia, como hace `01-analisis-general.md`, o se retiran | varios | 30 min |
| MC-06 | **Lectura de columnas.** `Int32.Parse(Convert.ToString(dr["x"]))` en unas 150 líneas, donde `Convert.ToInt32(dr["x"])` hace lo mismo sin pasar por texto | `Data/*Data.cs` | 1 h, mecánico |
| MC-07 | **Un solo contrato de entrada.** `ParametroDelimitado.Preparar` todavía acepta el `pParametro` plano en las lecturas; con `parametros` ya en todos los servicios Angular, la ruta vieja solo añade una forma más de llamar a la API | `Business/ParametroDelimitado.cs`, `04-api-referencia.md` | 30 min |
| MC-08 | **Hosting mínimo.** `Program.cs` + `Startup.cs` al modelo de `WebApplication.CreateBuilder`. D-05 lo dejó para «un commit aparte» que nunca llegó; sigue siendo opcional | `SISGAPO_API/Program.cs`, `Startup.cs` | 2 h |
| MC-09 | **Un solo registro.** NLog y `Microsoft.Extensions.Logging` conviven sin integrarse: los mensajes de Kestrel y de autenticación salen por un canal y con un formato, y los de la aplicación por otro. `NLog.Web.AspNetCore` o `ILogger<T>` del framework, pero uno | `Startup.cs`, `nlog.config`, las tres capas | 1 h |
| MC-10 | **Frontend.** `.toPromise()` (retirado en RxJS 8), `JSON.stringify` manual con `Content-Type` a mano en seis servicios, y doce `.spec.ts` que solo comprueban que exista un método. Ya anotado en `05-frontend.md`, sección 10; se queda como mantenimiento | `src/app/**/*.service.ts`, `*.spec.ts` | 3–4 h |
| MC-11 | **Rutas antiguas en comentarios.** `sql/01-esquema.sql:240` y `sql/09-usp-zonas.sql:10` citan `06-hallazgos.md`; `sql/cargar-base.ps1:27` cita `07-migracion-tier-free.md`. Son comentarios, no se tocaron en esta pasada; corregirlos con el próximo cambio de código | `sql/` | 5 min |

## 5. Documentación: qué estaba desactualizado y qué se hizo

Esta es la parte de la auditoría que **sí se aplicó**, porque el objetivo de la pasada era
dejar la documentación cerrada. Cada fila es una afirmación que ya no coincidía con el código.

| Documento | Qué estaba mal | Qué se hizo |
|---|---|---|
| `README.md` (raíz) | Presentaba los 48 hallazgos como auditoría vigente; la tabla de credenciales aparecía dos veces; el índice tenía nombres viejos | Remite al histórico y a este documento; una sola tabla; índice al día; línea de estado |
| `00-convenciones.md` | El árbol decía «.NET 5» y «Test: sin pruebas reales por ahora» | Corregido; el paso 4 de «antes de dar algo por terminado» apunta aquí |
| `01-analisis-general.md` | CUS-0009 «parcial» (está completo); «6 procedimientos» (son 9); métricas de agosto; inyección de dependencias «parcial»; la sección de estado inicial era histórica | Métricas de hoy; estado inicial movido a `historico/estado-inicial-2026-08.md` |
| `02-arquitectura.md` | La tabla de «lo que cambió» no incluía la inyección de dependencias, la validación de los DTO, el middleware, el límite de intentos, el CORS por configuración ni el 400 de las opciones no soportadas | Tabla completada; el cuerpo sigue siendo la foto de 2021, y lo dice |
| `03-modelo-de-datos.md` | El diagrama decía «texto plano» para la contraseña; «los bugs 9–13 no se corrigieron en `sql/`» (sí lo están); «usa `@@IDENTITY`» (usa `SCOPE_IDENTITY()`); «doce tablas» (son trece) | Corregido |
| `04-api-referencia.md` | Mostraba el `pParametro` plano como contrato; «`return null` → 204» (es un 400 con mensaje); URL de producción histórica | Contrato con `parametros`; errores reales; URL vigente |
| `05-frontend.md` | Recomendaba fijar `cross-env`, que ya está en `package.json`; daba por retirados los workflows de Static Web Apps de 2021, y queda uno | Corregido |
| `06-hallazgos.md` | 48 hallazgos, los 48 cerrados: no quedaba nada que auditar | Movido a `historico/hallazgos-2026.md`; la auditoría final cierra ahora la serie como documento 11 |
| `07-migracion-tier-free.md` | El nombre ya no describía el contenido; sin verificación posterior al 7 de septiembre; los límites de las ofertas gratuitas sin cifras | Renombrado a `06-infraestructura.md`; verificación de hoy; límites; remite al 10 |
| `07-plan-demo.md` | Swagger en el guion sin estar expuesto (H-06); C-02 como pendiente; la tabla de «una sola mejora» con mejoras ya hechas | Corregido |
| `08-mejoras-propuestas.md` | M-03 «parcial» (D-43 lo cerró en septiembre); ocho mejoras ya hechas ocupaban el documento | Las hechas, a `historico/mejoras-aplicadas.md`; quedan las abiertas |
| `09-decisiones.md` | Sin revisión posterior a D-47; sin decisiones del cierre | Sección «Revisión del 1 de octubre de 2026» y D-48 a D-50 |
| `11-estado-portafolio.md` | Estado del 7 de septiembre, con el reinicio del seed como único pendiente y sin fecha de cierre | Renombrado a `11-auditoria-y-cierre.md` y reescrito como estado final y lista de cierre |
| `sql/README.md` | «La lógica T-SQL no se tocó, incluidos sus bugs» (se corrigieron en agosto); «12 tablas» (son 13); la cadena de conexión «para `appsettings.json`» | Corregido |
| `Documento de Especificación de CUS.docx` | Documento de 2021 entre los documentos vivos | Movido a `historico/` |

## 6. Las decisiones, revisadas

El detalle, decisión por decisión, está en `09-decisiones.md`. El resumen:

| Resultado | Decisiones |
|---|---|
| **Vigentes sin cambios** | D-04, D-06, D-07, D-09 a D-16, D-18 a D-23, D-25 a D-47. Lo que decidieron sigue siendo cierto y el código lo cumple |
| **Vigentes, pero el 10 las toca** | D-01 (SQL Server se conserva, en contenedor); D-24 (con la API y el frontend en el mismo dominio, la cookie `HttpOnly` deja de ser imposible: sigue siendo opcional); D-05 y MC-08 |
| **Superadas** | D-02 («fuera de Azure no hay SQL Server gratuito»: con un VPS ya pagado, lo hay); D-03 (.NET 8 por ser LTS: deja de serlo en noviembre, D-50); D-08 y D-17 (ya ejecutadas o cerradas) |

## 7. Recomendaciones

En el orden en que conviene hacerlas. Las tres primeras son el cierre; el resto es lo
que se haría si el proyecto se reabre.

| # | Recomendación | Por qué | Esfuerzo |
|---|---|---|---|
| R-01 | **Aplicar H-01, H-02 y H-03 antes de archivar — hecho** | El repositorio queda sobre un runtime con soporte y sin paquetes NuGet vulnerables conocidos | — |
| R-02 | **Migrar al VPS en una rama separada** (`10-migracion-contabo.md`) — **hecho** | El estado Azure + Hostinger queda congelado primero en un tag; la migración no forma parte de este cierre | medio día |
| R-03 | Si Azure se queda: programar el reinicio del seed con un workflow `schedule` que ejecute `cargar-base` contra Azure SQL | Es el único pendiente de infraestructura desde septiembre. Exige abrir el cortafuegos de Azure SQL a los *runners* de GitHub o usar OIDC con `az sql server firewall-rule`; no es gratis en complejidad | 2 h |
| R-04 | Arreglos baratos con efecto visible: H-08, H-09, H-10 — **hechos** | Quedan cubiertos la baja con existencias, el despertar de Azure SQL y el reintento de configuración | — |
| R-05 | Mantener Swagger solo en desarrollo — **decidido** | El guion distingue la demostración local de la pública | — |
| R-06 | Dejar H-11 a H-16 y las MC documentadas, sin hacer | Son ruido para el visitante; valen si se reabre el proyecto, no para cerrarlo | — |
| R-07 | Sacar `cred.fake` y `SISGAPO.7z` del clon — **hecho** el 4 de octubre de 2026: la nota fue a la carpeta de claves del equipo y el `.7z`, a una de respaldos fuera del repositorio | Están ignorados por Git y no salen del equipo, pero una nota con datos de conexión no debería vivir dentro de un clon, y el `.7z` son 13 MB de una copia cuyo contenido ya está en el repositorio. Un gestor de contraseñas y una carpeta aparte | 5 min |
| R-08 | Fechar el cierre en el README y en este documento; no archivar el repositorio en GitHub mientras la demo esté en línea | Un repositorio archivado no ejecuta workflows ni admite cambios, y la demo seguirá necesitando un parche de vez en cuando | 5 min |

## 8. Estado final y lista de cierre

La demo queda cerrada el **2 de octubre de 2026** con login, panel, usuarios, zonas,
almacenes, categorías, productos, lotes, movimientos y kardex; backend en .NET 10,
frontend Angular 9 (14 desde el 4 de octubre, D-51) y SQL Server. La actualización de Angular, las mejoras MC y los
hallazgos H-11 a H-16 son decisiones o mantenimiento para una reapertura, no requisitos
de este cierre.

- [x] Auditoría de código y documentación consolidada en este documento.
- [x] H-01, H-02 y H-03: .NET 10, paquetes actualizados y análisis NuGet sin vulnerabilidades.
- [x] H-08, H-09 y H-10: tres fallos visibles corregidos.
- [x] H-06: Swagger se conserva solo para desarrollo y el guion lo indica.
- [x] D-49: migración a Contabo aprobada como trabajo posterior y aislado.
- [x] Estado Azure + Hostinger preparado como punto de retorno anterior a la migración.
- [x] Las 13 pruebas de integración corren en el CI contra SQL Server: el trabajo `sql` ejecuta
  las 39 sin omitir ninguna (validado el 4 de octubre de 2026).
- [x] Reinicio periódico del seed: cron nocturno en el VPS desde el 4 de octubre de 2026.
- [x] Enlace público actualizado a `https://sisgapo.devkora.com`.
