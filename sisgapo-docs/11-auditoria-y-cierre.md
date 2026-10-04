# 11 — Auditoría y cierre

Estado de la demo cerrada y lo que sigue abierto. La auditoría con la que se cerró —la
revisión del 1 de octubre de 2026, los hallazgos corregidos el 2 y el 4 de octubre y la lista
de cierre— está en
[`historico/auditoria-cierre-2026-10.md`](historico/auditoria-cierre-2026-10.md); la de
agosto–septiembre, en [`historico/hallazgos-2026.md`](historico/hallazgos-2026.md).

**Estado:** cerrado como demo de portafolio el 2 de octubre de 2026. Desde el 4 de octubre
corre en un VPS propio (`06-infraestructura.md`). Nada de lo que sigue bloquea la demo: son
decisiones o mantenimiento para una posible reapertura.

Los identificadores son los de la auditoría de cierre —`H-` hallazgos, `MC-` mejoras de
código—, así que las citas de los demás documentos siguen valiendo. La gravedad mide lo que
pesa para una demo cerrada: 🟡 conviene, pero el proyecto vive sin ello.

## 1. Estado verificado el 4 de octubre de 2026

| Comprobación | Resultado |
|---|---|
| Backend | .NET 10, compila sin avisos. Análisis NuGet, incluido el transitivo, sin vulnerabilidades |
| Pruebas | 39 en verde en el CI —26 unitarias y 13 de integración contra SQL Server—, sin omitir ninguna |
| Frontend | Angular 14 con Material 14; build de producción sin flags en Node 22 y 24 (D-51) |
| `npm audit --omit=dev` | 10 avisos, todos en los propios paquetes de Angular. Ver H-04 |
| Demo pública | `https://sisgapo.devkora.com` responde en menos de un segundo, sin arranque en frío, con certificado de Let's Encrypt |
| Datos de la demo | Se recargan desde el seed cada noche y en cada despliegue |
| Secretos | Ninguno versionado. Los del servidor viven en un `.env` que no sale de él |

## 2. Hallazgos abiertos

### Seguridad y mantenimiento

#### 🟡 H-04 · `npm audit` devuelve 10 avisos, todos en Angular

`sisgapo-web/package-lock.json`

Con Angular 9 eran 23, dos de ellos críticos, en herramientas de compilación que arrastraba
Webpack 4. La subida a Angular 14 (D-51) los bajó a 10 —4 altos y 6 moderados—, pero ahora
todos están en paquetes `@angular/*`, que sí llegan al navegador. Su corrección empieza en
Angular 20, más allá del techo que D-51 fija para no cambiar Material.

**Propuesta:** ninguna mientras el proyecto siga cerrado; es el coste aceptado de D-51. Si se
reabre para rediseñar la interfaz, subir de una vez a la versión vigente los cierra.
**Esfuerzo:** el de esa migración.

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

## 3. Mejoras de código propuestas

Nada de esto es un defecto visible. Son las cosas que un revisor que lea el código
anotaría, ordenadas por lo que más aportan por hora. Ninguna está aplicada.

| # | Mejora | Dónde | Esfuerzo |
|---|---|---|---|
| MC-01 | **Un solo catálogo de opciones de escritura.** Hoy «qué `sOpcion` escribe» está declarado tres veces: en el chequeo de rol de cada controlador, en el `bEscritura` de cada `Business` y en `DemoSoloLecturaFilter`. Si una entidad gana una opción, hay que acordarse de tres sitios | `Controllers/*`, `Business/*`, `Seguridad/DemoSoloLecturaFilter.cs` | 2 h |
| MC-02 | **Registrar cada excepción una vez.** `Data`, `Business`, el controlador y el middleware hacen `logger.Error` sobre la misma excepción: cuatro entradas por fallo. Quitar los `try/catch/log/throw` de las tres capas y dejar el middleware. Cambia la convención de `00-convenciones.md`, sección 8, así que es una decisión | las tres capas | 1 h |
| MC-03 | **Configuración inyectada.** `ConfiguracionBD` y `ConfiguracionJwt` construyen su propia `IConfiguration` estática y leen `appsettings` por su cuenta; las pruebas no pueden sustituirlas. Pasar a `IConfiguration`/`IOptions` y registrar `Conexion` en el contenedor en vez de `new Conexion(1)` en nueve constructores | `Data/ConfiguracionBD.cs`, `Seguridad/ConfiguracionJwt.cs`, `Data/*Data.cs` | 2 h |
| MC-04 | **Quitar los constructores sin parámetros de `Business`** (`: this(new XData())`). Mantienen viva la ruta `new` que D-43 cerró; solo los usa una prueba de `PoliticaMovimientoTests`, que puede construir el controlador con dobles | `Business/*.cs`, `Test/PoliticaMovimientoTests.cs` | 30 min |
| MC-05 | **Restos.** `using System.Net; using System.Net.Mail;` en `ProductoData`; `using Microsoft.AspNetCore.Cors;` y el comentario `//using System.Web.Http.Cors;` en `InventarioController`; `#region Almacen` encabezando `CrudProductos`; los comentarios `// fnServAlmacenes`. Y dos restos fuera del código: `sisgapo-web/.github/workflows/azure-static-web-apps-yellow-meadow-0e36f1a10.yml`, un workflow de 2021 que GitHub no ejecuta desde esa ruta y que apunta a un recurso que ya no existe; y las plantillas ARM de 2021 en `SISGAPO_API/Properties/ServiceDependencies/`, versionadas bajo una ruta que `.gitignore` excluye: o se declaran evidencia, como hace `01-analisis-general.md`, o se retiran | varios | 30 min |
| MC-06 | **Lectura de columnas.** `Int32.Parse(Convert.ToString(dr["x"]))` en unas 150 líneas, donde `Convert.ToInt32(dr["x"])` hace lo mismo sin pasar por texto | `Data/*Data.cs` | 1 h, mecánico |
| MC-07 | **Un solo contrato de entrada.** `ParametroDelimitado.Preparar` todavía acepta el `pParametro` plano en las lecturas; con `parametros` ya en todos los servicios Angular, la ruta vieja solo añade una forma más de llamar a la API | `Business/ParametroDelimitado.cs`, `04-api-referencia.md` | 30 min |
| MC-08 | **Hosting mínimo.** `Program.cs` + `Startup.cs` al modelo de `WebApplication.CreateBuilder`. D-05 lo dejó para «un commit aparte» que nunca llegó; sigue siendo opcional | `SISGAPO_API/Program.cs`, `Startup.cs` | 2 h |
| MC-09 | **Un solo registro.** NLog y `Microsoft.Extensions.Logging` conviven sin integrarse: los mensajes de Kestrel y de autenticación salen por un canal y con un formato, y los de la aplicación por otro. `NLog.Web.AspNetCore` o `ILogger<T>` del framework, pero uno | `Startup.cs`, `nlog.config`, las tres capas | 1 h |
| MC-10 | **Frontend.** `.toPromise()` (retirado en RxJS 8) y `JSON.stringify` manual con `Content-Type` a mano en seis servicios. Y los `.spec.ts`: once no compilan desde que cambiaron los constructores en 2026 y, cuando compilaban, solo comprobaban que existiera un método; no están en el CI. Ya anotado en `05-frontend.md`, sección 10; se queda como mantenimiento | `src/app/**/*.service.ts`, `*.spec.ts` | 3–4 h |
| MC-11 | **Rutas antiguas en comentarios.** `sql/01-esquema.sql:240` y `sql/09-usp-zonas.sql:10` citan `06-hallazgos.md`; `sql/cargar-base.ps1:27` cita `07-migracion-tier-free.md`. Son comentarios; corregirlos con el próximo cambio de código | `sql/` | 5 min |

## 4. Recomendaciones vigentes

| # | Recomendación | Por qué |
|---|---|---|
| R-06 | Dejar los hallazgos y las mejoras de este documento sin hacer mientras el proyecto siga cerrado | Son ruido para el visitante; valen si se reabre el proyecto, no para mantener la demo |
| R-08 | No archivar el repositorio en GitHub mientras la demo esté en línea | Un repositorio archivado no ejecuta workflows ni admite cambios, y la demo seguirá necesitando un parche de vez en cuando |

Las demás recomendaciones de la auditoría de cierre están hechas o ya no aplican; su
detalle, en el histórico.
