# 06 — Hallazgos

Inventario completo de problemas encontrados en el análisis. Clasificados en tres grupos:
**S** seguridad, **C** correctitud, **D** deuda técnica.

Cada hallazgo lleva una prioridad orientada al objetivo real —convertir esto en una demo
presentable—, no a un despliegue en producción:

- 🔴 **Bloqueante** — hay que arreglarlo antes de enseñar el proyecto a nadie.
- 🟠 **Importante** — un revisor técnico lo va a notar y va a preguntar.
- 🟡 **Menor** — conviene, pero no cambia la percepción del proyecto.

## Resumen

**48 hallazgos en total, 41 cerrados y verificados.** Esto es lo que sigue abierto:

| Hallazgo | Estado | Por qué sigue abierto |
|---|---|---|
| S-11 · Modo solo lectura apagado por defecto | Reinterpretado | Las escrituras deben quedar abiertas; el control correcto es el reinicio periódico del seed, que es infraestructura |
| S-12 · Cuentas históricas con `123456` | Corregido en el repositorio | Falta recargar la base de datos de la instancia pública |
| D-02 · Angular 9 fuera de soporte | Fuera de alcance | Migrar Angular 9 es un proyecto, no un arreglo |
| D-03 · Sin inyección de dependencias | Parcial | Falta DI real, y hacerla obliga a revisar los campos de instancia de `AlmacenData` y `ProductoData` |
| D-08 · Duplicación alta y entidades vacías | Parcial | El `CrudController<T>` genérico sigue descartado por la regla de cambios mínimos |
| D-13 · Frontend sin *lazy loading* | Aplazado | Riesgo de dejar una pantalla en blanco, sin beneficio medido |
| D-14 · Ningún componente usa `OnPush` | Aplazado | Obliga a un `markForCheck` por cada carga asíncrona, con el mismo riesgo |

Ninguno impide enseñar la demo, y dos —S-11 y S-12— dependen de la instancia pública, no de
este repositorio.

El inventario completo, con la gravedad que cada hallazgo tenía **cuando se encontró** —no la
que tiene hoy, porque casi todos están cerrados—:

| Grupo | 🔴 | 🟠 | 🟡 | Total |
|---|---|---|---|---|
| Seguridad | 6 | 5 | 1 | 12 |
| Correctitud | 6 | 12 | 3 | 21 |
| Deuda técnica | 0 | 4 | 11 | 15 |
| **Total** | **12** | **21** | **15** | **48** |

Cuatro de los de correctitud (C-12 a C-15) salieron **al aplicar los arreglos**, no en la
revisión inicial. Es lo normal: el primero de ellos tapaba a los otros tres.

---

## Estado — 2 de septiembre de 2026

Dos tandas de arreglos aplicadas: la de agosto y la de la migración a .NET 8 con
autenticación. Todo lo marcado como corregido está **verificado ejecutándolo** contra
SQL Server 2022 en Docker y, donde aplica, por HTTP contra la API.

| Hallazgo | Estado |
|---|---|
| C-01 · Los scripts SQL no recrean la base | ✅ Corregido — `docker compose up -d` la deja lista, y los scripts son reejecutables |
| C-02 · Editar producto descarta la mitad de los cambios | ✅ Corregido — en las tres capas; ver también C-12 |
| C-03 · Editar una zona crea un duplicado | ✅ Corregido — existen actualización y baja lógica |
| C-04 · NLog no escribe en ningún sitio | ✅ Corregido — `nlog.config` a consola y archivo |
| C-05 · La comprobación de zonas duplicadas no funciona | ✅ Corregido — con rama `ELSE` y mensaje al usuario |
| C-07 · Escrituras multi-tabla sin transacción | ✅ Corregido en Productos 06/07 y Usuarios 04 |
| C-08 · Los controllers devuelven `null` | ✅ Corregido — `BadRequest` con el motivo |
| C-09 · Sin middleware de excepciones | ✅ Corregido — `UseExceptionHandler` con cuerpo consistente |
| C-11 · El módulo Cliente es código muerto | ⚠️ **Hallazgo rectificado** — no era código muerto; ver el detalle |
| C-12 · Rangos de `sOpcion` mal copiados en Productos | ✅ Corregido (hallazgo nuevo) |
| C-13 · El modal de edición de producto no precarga nada | ✅ Corregido (hallazgo nuevo) |
| C-14 · Los filtros de Productos no filtran | ✅ Corregido (hallazgo nuevo) |
| C-15 · Eliminar un producto usa el identificador equivocado | ✅ Corregido (hallazgo nuevo) |
| C-16 · El formulario de acceso no se puede pulsar si la ventana es baja | ✅ Corregido (hallazgo nuevo) |
| C-17 · La pantalla de acceso no tiene diseño para móvil | ✅ Corregido (hallazgo nuevo) |
| C-18 · Errores silenciosos al iniciar sesión | ✅ Corregido (hallazgo nuevo) |
| S-01 · Credenciales en el repositorio | ✅ Corregido — las de Azure SQL y Gmail nunca estuvieron en el historial; para la que sí estaba, ver S-10 |
| S-10 · Contraseña de SonarQube en claro desde 2021 | ✅ Cerrado — fuera del historial y de los refs de respaldo; no procede rotar (instancia local, en desuso) |
| S-08 · Mezcla de HTTP/HTTPS y CORS que no cuadra | ✅ Corregido — orígenes por configuración |
| D-04 · Configuración leída del disco en cada petición | ✅ Corregido — `ConfiguracionBD`, una vez por proceso |
| D-09 · Restos de andamiaje y archivos generados | ✅ Limpiado |
| S-02 · Contraseñas en texto plano | ✅ Corregido — bcrypt (factor 11); la opción 03 ya no devuelve la contraseña |
| S-03 / S-04 · Sin autenticación ni rutas protegidas | ✅ Corregido — JWT, `[Authorize]`, guards por rol |
| S-09 · Sin límite de intentos de autenticación | ✅ Corregido — cinco solicitudes por IP y minuto; las siguientes reciben HTTP 429 |
| S-05 · `System.Data.SqlClient` con CVE | ✅ Corregido — migrado a `Microsoft.Data.SqlClient` 5.1.6 |
| S-06 · `Microsoft.ApplicationBlocks.Data` sin mantenimiento | ✅ Eliminado del proyecto |
| S-07 · El delimitador `\|` no se escapa | ✅ Corregido — el frontend envía valores separados y el backend los valida antes de reconstruir `pParametro` |
| C-06 · El nombre de usuario siempre lleva sufijo | ✅ Corregido — sufijos solo ante colisiones reales |
| C-10 · El único test no puede pasar | ✅ Corregido — 16 pruebas unitarias y 12 de integración contra SQL Server, ejecutadas por GitHub Actions |
| D-01 · .NET 5 fuera de soporte | ✅ Corregido — migrado a .NET 8, 0 warnings |
| D-02 · Angular 9 fuera de soporte | ⏳ Pendiente |
| D-03 · Sin inyección de dependencias | ⚠️ Parcial — `LoginBusiness` y `UsuarioBusiness` admiten dobles; el resto conserva instanciación directa |
| D-05 · Consulta de metadatos en cada escritura | ✅ Corregido — una llamada a la base en vez de dos |
| D-06 · Los precios son `INT` | ✅ Corregido — `DECIMAL(10,2)` en la base y `decimal` en C# |
| D-07 · Los teléfonos son `INT` | ✅ Corregido — la columna pasa a `sTelefono VARCHAR(20)` |
| D-08 · Duplicación alta y entidades vacías | ⚠️ Parcial — fuera las cinco clases vacías y los DTO duplicados; el `CrudController<T>` genérico sigue descartado |
| S-11 · Modo solo lectura apagado por defecto | ⏳ Reinterpretado — escrituras abiertas es lo correcto; el control es el reinicio del seed |
| S-12 · Cuentas de persona con `123456` activas en producción | ✅ Corregido en el seed — las históricas llevan clave fuerte no publicada; solo las `demo.*` inician sesión. Falta recargar la BD pública |
| C-19 · `CategoriaData` filtra el mensaje interno de una excepción al cliente | ✅ Corregido — `logger.Error(e); throw;` como el resto |
| C-20 · `UsuarioData`/`ZonaData` no cierran la conexión SQL si hay excepción | ✅ Corregido — cierre en `finally` en las lecturas |
| C-21 · Los listados no informan errores de carga, salvo Zona | ✅ Corregido — componente `app-estado-carga` con reintento en los seis listados |
| D-10 · Todo el backend es síncrono | ✅ Corregido — `async`/`await` de punta a punta, de `Conexion` a los controllers |
| D-11 · DTOs sin validar y controllers sin guard de nulos | ✅ Corregido — anotaciones en los DTO y un 400 con el mismo `{cod, mensaje}` de siempre |
| D-12 · Regla de rol escondida en una posición del array | ✅ Corregido — `PoliticaMovimiento` con constantes y seis pruebas |
| D-15 · `movimientos.component.ts` mezcla tabla, filtros y fechas | ✅ Corregido — la cronología sale a `KardexCronologiaService`; 378 → 311 líneas |
| D-13 · Frontend sin *lazy loading* | ⏳ Pendiente — es el refactor más invasivo que queda |
| D-14 · Ningún componente usa `OnPush` | ⏳ Pendiente — obliga a un `markForCheck` por carga asíncrona; sin beneficio medido |

---

## Verificación en vivo — 6 de septiembre de 2026

El frontend apunta ya a un backend público real
(`app-sisgapo-api-egbrd9hygfcsdvgf.eastus-01.azurewebsites.net`, commit `bbab4ee`), así que
esta vez la revisión no fue solo de código: se probó la API desplegada con peticiones HTTP
reales, sin credenciales.

| Comprobación | Resultado |
|---|---|
| Swagger en producción | `GET /swagger/index.html` y `/swagger/v1/swagger.json` → **404**. No está expuesto. Coincide con `Startup.Configure`, que solo lo registra dentro de `env.IsDevelopment()`. |
| CORS con un origen no autorizado | `OPTIONS /LoginService` con `Origin: https://evil.example.com` responde `204` **sin** `Access-Control-Allow-Origin`. El navegador bloquea la respuesta: no hay combinación de `AllowAnyOrigin` + `AllowCredentials`, ni un origen reflejado sin validar. |
| Mensajes de error | Un JSON malformado devuelve el `ProblemDetails` estándar de ASP.NET Core (posición del error, sin ruta de archivo ni traza). El middleware global de `Startup.cs` solo revela el mensaje real fuera de producción o para `ArgumentException`; el resto cae a un texto genérico. |
| `[Authorize]` por controlador | Los siete controladores llevan `[Authorize]` salvo `LoginController` y `ConfiguracionController`, ambos `[AllowAnonymous]` a propósito: el primero emite el token, el segundo expone un único booleano (`Demo:SoloLectura`) sin dato sensible. Sin huecos. |
| Autorización por rol en escrituras | Confirmado en código, no solo en el frontend: `InventarioController.cs:54,116,183,250` y `ZonaController.cs:53,74,101` comprueban `User.IsInRole(...)` antes de escribir. Un Asistente que llame directo a la API no puede editar catálogo, lotes ni hacer un ajuste de inventario. |
| SQL dinámico | Sin `sp_executesql`, `EXEC(...)` ni `CommandType.Text` en ninguna de las tres capas ni en los procedimientos de `sisgapo-docs/sql/`. Todo el acceso a datos pasa por procedimientos con `SqlParameter`. No hay vector de inyección SQL. |
| Secretos en el historial | Re-verificado de forma independiente sobre todo `git log --all`: sin coincidencias de contraseñas, claves privadas ni tokens de servicios (Azure, Gmail, GitHub, Slack, Google). Las dos únicas coincidencias del barrido son el texto redactado de S-01, no un secreto real. |

Conclusión de esta parte: la superficie de autenticación, autorización y CORS está bien
cerrada, y **verificada contra el despliegue real, no solo en local.** El único punto
nuevo y genuinamente pendiente es S-11.

### 🟠 S-11 · El modo solo lectura de la demo está apagado por defecto, y ya hay una instancia pública

`sisgapo-api/SISGAPO_API/appsettings.json:14`

```json
"Demo": { "SoloLectura": false }
```

`DemoSoloLecturaFilter` (en `SISGAPO_API/Seguridad/DemoSoloLecturaFilter.cs`) sí funciona
correctamente cuando está activado — bloquea con 403 las opciones de escritura de cada
controlador. El problema es el valor por defecto: **el repositorio, tal cual está, sirve
una demo con escritura habilitada.** Y desde el commit `bbab4ee` el frontend ya apunta a
una instancia real en Azure App Service, no a `localhost`.

Las tres cuentas públicas —`demo.admin`, `demo.supervisor`, `demo.asistente`— comparten
`SisgapoDemo2026!` (documentado en S-02). Con `SoloLectura` en `false`, cualquiera con esa
contraseña puede editar o borrar el catálogo, los lotes y los movimientos que **otros
visitantes** están viendo en ese mismo momento. No es una brecha de seguridad en el sentido
clásico —son cuentas de demo, sin datos reales—, pero sí rompe la demo para el siguiente
visitante, y es exactamente la situación para la que se construyó `DemoSoloLecturaFilter`.

**Qué falta, y no se puede verificar desde este repositorio:** si la variable de entorno
`Demo__SoloLectura` está puesta en `true` en la configuración del App Service de Azure. Si
no lo está, la API pública corre con el valor por defecto del `appsettings.json`, que es
`false`.

**Arreglo:** confirmar en el portal de Azure (o con `az webapp config appsettings list`)
que `Demo__SoloLectura=true` está definida en la instancia pública. Si el plan es que la
demo sea de solo consulta para el público general y de escritura solo en sesiones
acompañadas, dejarlo en `true` por defecto ahí y desactivarlo puntualmente, no al revés.

**Reinterpretado el 6 de septiembre de 2026.** Para una demo de portafolio, el enfoque de
arriba está equivocado: las escrituras deben quedar **abiertas**, porque poder crear un
producto o registrar un movimiento es lo que hace interesante la demo. El riesgo real no es
que la gente escriba —es para lo que está—, sino que sin reinicio los datos se degraden. El
control correcto es el **reinicio periódico del seed**, no el candado de solo lectura, que
queda como respaldo puntual. Ver el análisis completo en `11-estado-portafolio.md`.

### 🔴 S-12 · Cuentas de persona con contraseña `123456`, activas en producción

`sisgapo-web/src/scripts/... → sisgapo-docs/sql/03-seed.sql:65-96`

El seed crea seis cuentas históricas con nombres de persona reales —`jose.m`,
`alex.quispe`, `maria.ramirez`, `carlos.mendoza`, `lucia.fernandez`— activas (`bEstado = 1`)
y todas con la contraseña `123456`. El propio comentario del seed lo dice: *"Las cuentas
históricas no públicas conservan 123456"*. El hash es bcrypt de verdad (factor 11); el
problema es lo que protege.

**Verificado contra la instancia pública** el 6 de septiembre de 2026:

```
POST /LoginService  {"sNombreUsuario":"jose.m","sContrasenia":"123456"}
→ 200, token JWT válido, rol Supervisor (nRol = 2)
```

Un revisor técnico prueba `123456` por reflejo, entra como Supervisor, y la afirmación que
vende la auditoría —"la autenticación ya es real: bcrypt, JWT" (S-02)— se desmiente sola.
Es de las peores primeras impresiones posibles justamente porque el resto de la seguridad
está bien hecha.

**Arreglo:** dejar activas solo las tres cuentas `demo.*` (que usan `SisgapoDemo2026!`) y
poner las históricas en `bEstado = 0`, o rehashearles una contraseña fuerte que no se
publique. No aportan nada que las `demo.*` no cubran. La cuenta `admin` de 2021 ya está
bien: su hash **no** coincide con `123456` (comprobado), tiene una clave de mantenimiento
separada. Ver `11-estado-portafolio.md`.

**Arreglo aplicado (6 de septiembre de 2026):** en `sql/03-seed.sql`, las seis cuentas
históricas (`jose.m` … `jorge.salazar`) se rehashearon con bcrypt factor 11 sobre una
contraseña fuerte que **no se publica en ningún sitio**. Siguen apareciendo en el listado
de Usuarios como datos de relleno realistas, pero ya no se entra con `123456`. Las tres
`demo.*` conservan `SisgapoDemo2026!` para el acceso rápido de la demo. **Pendiente:**
recargar la base de datos de la instancia pública para que el cambio surta efecto ahí
(`docker compose up db-init`, o el equivalente en Azure).

## Tanda de deuda técnica — 6 de septiembre de 2026

Cerrada la lista de correctitud y seguridad, esta tanda ataca los hallazgos **D**, que son
los que solo ve quien lee el código. Siete corregidos, dos aplazados con motivo.

| Hallazgo | Qué se hizo | Cómo se comprobó |
|---|---|---|
| D-06 · Precios `INT` | `DECIMAL(10,2)` en la base, `decimal` en C#, importes con dos decimales en la vista | Alta de producto con precio `7.25` por HTTP; el panel devuelve `84616.90` |
| D-07 · Teléfonos `INT` | `sTelefono VARCHAR(20)`, y la validación acepta el prefijo `+51` | Alta de usuario con `+51987000111`; se guarda y se devuelve tal cual |
| D-08 · Entidades vacías y DTO duplicados | Fuera cuatro clases marcador, `UsuarioEntity` y `EntRequestUsuario` | Compila con 0 avisos; el genérico `CrudController<T>` sigue descartado |
| D-10 · Backend síncrono | `async`/`await` en `Conexion`, los nueve `*Data`, los nueve `*Business` y los seis controllers | 38 pruebas en verde y recorrido completo por HTTP |
| D-11 · DTO sin validar | Anotaciones en los DTO más guard de nulos, con el `{cod, mensaje}` de siempre en el 400 | Cuatro peticiones malformadas, cuatro 400 con el mensaje correcto |
| D-12 · Regla de rol en una posición de array | `PoliticaMovimiento` + `TipoMovimiento`, con pruebas | Seis pruebas nuevas; 403 y 200 confirmados por HTTP con el token del Asistente |
| D-15 · Componente de movimientos sobrecargado | La cronología sale a `KardexCronologiaService` | El build de producción compila; 378 → 311 líneas |
| D-13 · Sin *lazy loading* | **Aplazado** | Reparte 15 componentes y los módulos de Material entre cuatro módulos; se rompe en silencio |
| D-14 · Sin `OnPush` | **Aplazado** | Exige un `markForCheck` por carga asíncrona; sin él los listados se quedan en blanco |

D-02 (Angular 9) sigue fuera de alcance: es una migración mayor, no un arreglo.

La base de datos se recargó con `docker compose up db-init` antes y después de las pruebas,
así que la demo local queda con el seed limpio.

---

## S — Seguridad

### 🔴 S-01 · Credenciales reales en el repositorio

`sisgapo-api/SISGAPO_API/appsettings.json:11`

```json
"connectionString": "Server=servidorsqlsan.database.windows.net.;Database=DB_SISGAPO;User ID=<usuario>;Password=<contraseña>"
```

> Los valores reales están **redactados a propósito**: este documento es público y
> republicarlos sería repetir el error que describe. Estaban en claro, con un usuario y
> una contraseña de quince caracteres.

Y una segunda contraseña, de una cuenta de Gmail, en `sisgapo-api/Data/ProductoData.cs:190`,
dentro de un bloque comentado que enviaba notificaciones por correo:

```csharp
//    string EmailOrigen = "<cuenta>@gmail.com";
//    string Contrasenia = "<contraseña>";
```

El servidor SQL ya no existe (`01-analisis-general.md`, sección 4), pero **ambas contraseñas deben considerarse
comprometidas**. Si están reutilizadas en cualquier otro sitio, cámbialas hoy.

### Verificación del historial — 23 de agosto de 2026

Cuando se escribió este hallazgo no había repositorio local, así que quedó abierta la
pregunta de si los secretos estaban también en el historial de Git. **Ya está comprobado
contra los repositorios remotos, y la respuesta es que no.**

Se buscaron cinco cadenas en la historia completa de `SISGAPO.Back` y `SISGAPO.Front`
(`git log --all -S`), incluidas todas las ramas:

| Cadena buscada | Back | Front |
|---|---|---|
| Nombre del servidor de Azure SQL | 0 commits | 0 commits |
| Contraseña de Azure SQL | 0 | 0 |
| Contraseña de la cuenta de Gmail | 0 | 0 |
| Usuario de Azure SQL (`User ID=…`) | 0 | 0 |
| Cuenta de Gmail | 0 | 0 |

*(Las cadenas concretas no se reproducen aquí; ver la nota de S-01.)*

El `appsettings.json` que sí se publicó, en los cuatro commits que lo tocan, siempre
tuvo una cadena local inofensiva:

```json
"connectionString": "Server=.;Database=DB_SISGAPO;Trusted_Connection=True;"
```

Y el bloque de correo de `ProductoData.cs` se subió con las credenciales vacías
(`string EmailOrigen = "@gmail.com"; string Contrasenia = "";`).

**Conclusión, rectificada el 25 de agosto de 2026.** Para las credenciales de Azure SQL y
de Gmail lo anterior se sostiene: nunca estuvieron en Git. Lo que no se sostiene es lo que
se dedujo de ahí —«publicar los repositorios no filtra nada, y no hace falta reescribir el
historial»—, porque solo se habían buscado esas cinco cadenas. Un barrido posterior de los
66 commits encontró una credencial distinta, en claro y presente desde 2021: ver S-10. El
historial **sí** hubo que reescribirlo.

### Arreglo aplicado

Cadena de conexión fuera del código: se resuelve en `Data/ConfiguracionBD.cs` desde la
variable de entorno `SISGAPO_CONNECTION_STRING`, con `appsettings.json` reducido a un
marcador de posición vacío. El bloque de correo comentado, con su contraseña, se eliminó.

### 🔴 S-02 · Contraseñas en texto plano — **corregido**

`TBL_LOGIN.sContrasenia` guarda la contraseña sin cifrar. El seed original crea
`admin` / `123456`. `USP_MNT_Login` compara con `=` directo, y `USP_MNT_Usuarios` opción `03`
**devuelve la contraseña al cliente** dentro de un `SELECT *`.

En 2026 esto es indefendible en cualquier conversación técnica, y es de las cosas que un
cliente potencial con perfil técnico va a mirar primero.

**Arreglo:** BCrypt o Argon2 en la capa de aplicación, `VARCHAR(255)` para el hash, y quitar
`sContrasenia` de la proyección de la opción `03`. Para el seed, generar los hashes de las
contraseñas de demo. Ver `09-mejoras-propuestas.md`, M-01.

**Nota sobre las cuentas `demo.*`.** Las tres —`demo.admin`, `demo.supervisor`,
`demo.asistente`— comparten `SisgapoDemo2026!` y la pantalla de acceso la muestra en claro.
No es un descuido: son credenciales públicas por diseño, contra una base sin datos reales y
con la demo desplegada en modo consulta (`Demo:SoloLectura`). Se guardan con el mismo bcrypt
que las demás, porque el mecanismo tiene que ser el real aunque el dato no lo sea. La cuenta
`admin` de 2021 conserva una clave de mantenimiento distinta, que no se publica en ningún
sitio. Ver `10-decisiones.md`, D-37.

### 🔴 S-03 · La API no tiene autenticación — **corregido**

Ningún controller lleva `[Authorize]`. `Startup.Configure` invoca `app.UseAuthorization()`
sin un `app.UseAuthentication()` delante, y no hay esquema de autenticación registrado en
`ConfigureServices`. El resultado es que ese `UseAuthorization()` es decorativo.

`LoginService` no emite ningún token: devuelve un rol y ahí acaba. Las peticiones posteriores
no llevan ninguna credencial.

**Cualquiera con la URL puede listar, crear, editar y dar de baja usuarios:**

```bash
curl -X POST http://<api>/UsuariosService \
  -H 'Content-Type: application/json' \
  -d '{"sOpcion":"01","pParametro":""}'
```

Si publicas la demo, publicas una API abierta. Ver `09-mejoras-propuestas.md`, M-02.

### 🔴 S-04 · El frontend no protege ninguna ruta — **corregido**

`app-routing.module.ts` no declara un solo `canActivate`. Escribir `/usuarios` en la barra de
direcciones entra directo, sin pasar por login.

`nav-menu.component.ts` lee `localStorage.getItem("Rol")` para decidir si muestra el menú,
pero es puramente cosmético: cualquiera puede ejecutar
`localStorage.setItem('Rol','1')` en la consola del navegador y quedar como administrador.

Además, los componentes de lista **no filtran acciones por rol**: `usuarios-list`,
`almacenes-list`, `categoria` y `productos` muestran los botones de crear, editar y eliminar
a todo el mundo. La distinción entre Administrador y Supervisor que define el documento de
casos de uso no existe en el código.

### 🟠 S-05 · Dependencia con vulnerabilidades conocidas

`System.Data.SqlClient` 4.8.2 en `Data/Data.csproj`. La compilación lo avisa:

```
NU1903: 'System.Data.SqlClient' 4.8.2 has a known high severity vulnerability
NU1902: 'System.Data.SqlClient' 4.8.2 has a known moderate severity vulnerability
```

**Arreglo:** migrar a `Microsoft.Data.SqlClient` (versión actual). Es el paquete sucesor y
mantiene la API: básicamente cambiar el `using`. Ojo con un cambio de comportamiento —
`Microsoft.Data.SqlClient` 4.0+ usa `Encrypt=true` por defecto, así que la cadena de conexión
necesita `TrustServerCertificate=True` contra un SQL Server local con certificado autofirmado.

### 🟠 S-06 · `Microsoft.ApplicationBlocks.Data` está sin mantenimiento

Versión 2.0.0, del *Data Access Application Block* de Enterprise Library (~2005). Es un
ensamblado solo para .NET Framework; el compilador avisa con `NU1701`. Hoy funciona en
.NET 5 gracias a la capa de compatibilidad, pero **no hay garantía de que funcione en
.NET 8/9**, y no recibe parches de seguridad desde hace dos décadas.

Se usa solo en `Conexion.cs`, para `SqlHelper.ExecuteReader`, `ExecuteScalar` y
`ExecuteDataset`. Reemplazarlo por ADO.NET plano o Dapper son unas 80 líneas.
Ver `09-mejoras-propuestas.md`, M-03.

### 🟠 S-07 · El delimitador `|` no se escapa — **corregido**

Todo `pParametro` es una concatenación con `|` que el procedimiento vuelve a separar con
`dbo.Split`. **Nada valida ni escapa el delimitador en los datos.**

Un almacén llamado `Norte|Sur` desplaza todos los parámetros siguientes: la dirección pasa a
ser `Sur`, el supervisor pasa a ser la dirección, y el `CAST(... AS INT)` revienta o —peor—
convierte algo que no debía.

No es inyección SQL: los parámetros sí viajan como `SqlParameter`. Es corrupción de datos y
error en tiempo de ejecución. Con un texto elegido a propósito, un usuario puede provocar
escrituras con valores que la interfaz nunca le ofreció.

**Arreglo mínimo:** rechazar `|` en la validación del formulario y también en el backend.
**Arreglo real:** abandonar el formato delimitado y pasar objetos JSON tipados.
Ver `09-mejoras-propuestas.md`, M-06.

**Arreglo aplicado:** los servicios Angular envían cada valor por separado en `parametros`.
La capa de negocio rechaza cualquier valor que contenga `|` y solo después construye el
`pParametro` que esperan los procedimientos existentes. Las escrituras ya no aceptan el
contrato plano antiguo, porque una cadena ya concatenada no permite distinguir datos de
separadores. Verificado por HTTP: `Norte|Sur` devuelve 400 antes de ejecutar SQL.

### 🟠 S-08 · Mezcla de HTTP y HTTPS, y CORS que no cuadra

Tres problemas entrelazados en la configuración de producción:

1. `environment.prod.ts` apunta a `http://sisgapoback.azurewebsites.net/` — **HTTP**, no HTTPS.
2. `Startup.Configure` llama a `app.UseHttpsRedirection()`, que responde con un 307 a toda petición HTTP. En un `POST` con preflight CORS, eso suele romper la llamada.
3. El origen permitido en producción es `https://sisgapo.azurewebsites.net`, pero el frontend se desplegaba en Azure Static Web Apps (`*.azurestaticapps.net` — hay dos workflows). **Los dominios no coinciden**, así que el navegador habría bloqueado las respuestas.

Sospecho que la demo desplegada **nunca llegó a funcionar de extremo a extremo**, o funcionó
con una configuración que no quedó en el repositorio.

**Arreglo:** el origen CORS debe venir de configuración, no estar escrito en el código, y el
frontend debe llamar siempre por HTTPS.

### 🔴 S-10 · Contraseña de SonarQube en claro, en el historial desde 2021

`sisgapo-web/sonar-project.properties`

```properties
sonar.login=admin
sonar.password=<contraseña de quince caracteres>
```

Estaba en la punta de `main` y en 23 commits, desde `Fix and Sonar 31-08` (31 de agosto de
2021). El repositorio ha sido público todo ese tiempo.

La verificación de S-01 no lo vio porque buscó **cinco cadenas concretas** —las de Azure SQL
y Gmail— en lugar del *patrón* de una credencial. Es el fallo clásico de comprobar una
hipótesis en vez de buscar el problema: «no hay secretos en el historial» se apoyaba en
realidad en «no están estos cinco secretos».

**Arreglo aplicado (25 de agosto de 2026).** Las dos líneas salen del archivo, que ahora
remite a `SONAR_TOKEN`, y se reescribió el historial de los 23 commits sustituyendo el blob
por su versión saneada. Comprobado: 0 coincidencias en todos los commits alcanzables desde
`main`.

**Lo que el arreglo NO hace.** Reescribir el historial no revoca nada. La contraseña estuvo
pública cuatro años: **hay que rotarla** y comprobar que no está reutilizada. Además GitHub
conserva los commits huérfanos de los *push* anteriores y los sigue sirviendo por URL
directa, así que el valor antiguo continúa siendo recuperable por quien tenga un hash previo.

### 🟡 S-09 · Sin límite de intentos de autenticación — **corregido**

CUS-0009 lo especifica explícitamente ("si el usuario ha excedido el número de intentos…").
En el estado original no estaba implementado en ninguna capa: sin *rate limiting*,
`USP_MNT_Login` aceptaba intentos ilimitados.

Con contraseñas de seis dígitos numéricos como las del seed, un ataque de fuerza bruta es
trivial. Relevante solo si la demo queda expuesta públicamente con datos que importen.

**Arreglo aplicado:** política de ventana fija en ASP.NET Core, particionada por dirección
IP. Permite cinco solicitudes a `LoginService` por minuto, no mantiene cola y devuelve 429
con un mensaje explícito a partir de la sexta. El frontend distingue esa respuesta de unas
credenciales incorrectas. Verificado por HTTP con la secuencia 401, 401, 429.

---

## C — Correctitud

### 🔴 C-01 · Los scripts SQL no recrean la base de datos

Cinco fallos bloqueantes acumulados. `CreacionTablas.sql` no crea la columna
`TBL_USUARIO.nRol`, que usan el seed y cuatro procedimientos; `USP_MNT_Almacenes.sql` usa
`ALTER PROCEDURE` en vez de `CREATE`; `CreacionTablasParte2.sql` y `PoblacionDatosParte2.sql`
duplican objetos y datos; y todos llevan `USE DB_SISGAPO`, que Azure SQL no admite.

Detalle completo en `03-modelo-de-datos.md`, sección 4. Versión corregida y **verificada
ejecutándose** en `sql/`.

Es el hallazgo con más impacto práctico: sin base de datos no hay demo.

### 🔴 C-02 · Editar un producto descarta la mitad de los cambios

El frontend envía 10 parámetros; `USP_MNT_Productos` opción `07` espera 11. El desfase deja
`@nIdCatProd` y `@nIdLote` en `NULL`, de modo que dos de los cuatro `UPDATE` no afectan a
ninguna fila — y el procedimiento igual responde `'1|Se actualizó con éxito'`.

Verificado contra SQL Server 2022: al pedir mover un producto al almacén 2 / categoría 2 y
cambiar sus fechas, `TBL_CAT_PROD` se quedó en 1/1 y `TBL_LOTE` conservó las fechas
originales.

**Cambiar un producto de almacén no funciona. Cambiar su fecha de vencimiento tampoco.** Son
las dos operaciones centrales de un sistema de gestión de almacén con control de caducidad.

Se corrigió primero alineando las posiciones, y después el módulo de Lotes eliminó la clase
entera de error: la opción `07` se quedó con cinco parámetros —nombre, almacén, categoría y
los dos identificadores— y dos `UPDATE`. Las fechas y la existencia se mantienen desde
`USP_MNT_Lotes` y `USP_MNT_Movimientos`. Ver `04-api-referencia.md`, secciones 6 a 6.2.

### 🔴 C-03 · Editar una zona crea un duplicado

`zona-form.component.ts` carga la zona por id cuando la ruta trae `:id`, pero al guardar
siempre llama a `saveZona()`, que hace `POST /api/zona` → `USP_MNT_Zonas` opción `03`, que es
un `INSERT`. Y antes borra el identificador de forma explícita:

```typescript
delete this.lZona.nIdZona;
```

**No existe operación de actualización de zonas** en ninguna capa: ni en el procedimiento, ni
en `ZonaData`, ni en `ZonaController`, ni en `ZonaService`. Tampoco existe la baja.

La comprobación de duplicados del procedimiento tampoco ayuda (ver C-05), así que la zona
duplicada se crea sin ningún obstáculo y la interfaz navega de vuelta al listado como si
todo hubiera ido bien.

### 🔴 C-04 · NLog no escribe en ningún sitio

Las tres capas están sembradas de `logger.Error(e)` — 24 apariciones. **No existe
`nlog.config` en ningún proyecto**, y no se llama a `LogManager.Configuration` en el arranque.
NLog sin configuración no tiene destinos: todos esos `Error` se descartan.

Combinado con la ausencia de un middleware de excepciones (C-09), el resultado es que cuando
algo falla en producción **no queda rastro en el servidor ni mensaje en el cliente**.

**Arreglo:** añadir un `nlog.config` con destino a consola y archivo, o —mejor para .NET
moderno— sustituir NLog por el `ILogger<T>` del framework, que ya sale configurado y va a
la salida estándar (que es lo que leen los contenedores y App Service).

### 🟠 C-05 · La comprobación de zonas duplicadas no funciona

`USP_MNT_Zonas` opción `03`:

```sql
IF ((SELECT COUNT(*) FROM [TBL_ZONA] WHERE sNombre = LOWER(@sNombre)) = 0)
```

Compara el valor almacenado contra la versión en minúsculas del parámetro. Con la
intercalación por defecto de SQL Server (insensible a mayúsculas) la comparación sí funciona
por accidente para nombres idénticos, pero el `LOWER` no aporta nada y da una falsa sensación
de normalización; con una intercalación sensible a mayúsculas dejaría de detectar duplicados.

El problema serio es otro: **no hay rama `ELSE`**. Si el duplicado se detecta, el
procedimiento no devuelve nada, `ExecuteNonQuery()` devuelve 0, `CREATE_ZonaData` devuelve
`""`, y el componente navega igual al listado. **El usuario nunca se entera de que no se
guardó.**

### 🟠 C-06 · El nombre de usuario generado siempre lleva sufijo

En el procedimiento original, `USP_MNT_Usuarios` opción `04` calculaba
`@nContador = COUNT(*) + 1` y luego comprobaba
`IF (@nContador > 0)`, condición que se cumple siempre. Además el `COUNT(*)` se ejecuta
después del `INSERT` del propio usuario.

**Arreglo aplicado:** se intenta primero el nombre base y se añade `2`, `3`, etc. únicamente
si ya existe en `TBL_LOGIN`. La creación de Usuario y Login comparte una transacción.
Verificado por HTTP: dos altas con el mismo nombre base generaron `prueba.duplicada` y
`prueba.duplicada2`, con el mismo número de filas en ambas tablas.

### 🟠 C-07 · Las escrituras multi-tabla no usan transacciones

`USP_MNT_Productos` opción `06` encadena cuatro `INSERT` (`TBL_PRODUCTO` → `TBL_CAT_PROD` →
`TBL_LOTE` → `TBL_DET_PRODUCTO`) sin `BEGIN TRANSACTION`. Si el tercero falla, los dos
primeros quedan confirmados: producto sin lote ni detalle, que después rompe el `INNER JOIN`
de la opción `03` y hace que ese producto **desaparezca del listado** sin explicación.

Lo mismo en `USP_MNT_Usuarios` opción `04` (usuario sin credenciales → no puede entrar
nunca) y en la opción `07` de productos (cuatro `UPDATE` sueltos).

`Conexion.cs` tiene un campo `SqlTransaction sqlTransaction` que se consulta en varios sitios
(`if (sqlTransaction != null)`) pero **nunca se asigna**: siempre es `null`. Es soporte
transaccional a medio escribir que quedó abandonado.

**Arreglo aplicado:** las opciones 06 y 07 de Productos y la opción 04 de Usuarios usan
transacciones locales en sus procedimientos y revierten el conjunto completo ante errores.

### 🟠 C-08 · Los controllers devuelven `null`

Los seis controllers terminan con:

```csharp
else
{
    return null;
}
```

ASP.NET Core traduce un `IActionResult` nulo a **204 No Content** con cuerpo vacío. El
frontend, que espera un arreglo o un objeto `{cod, mensaje}`, recibe `null` y falla al
acceder a sus propiedades — sin mensaje para el usuario.

Debería ser `BadRequest($"sOpcion no soportada: {sOpcion}")`.

### 🟠 C-09 · Sin middleware de manejo de excepciones

El patrón `catch (Exception e) { logger.Error(e); throw; }` se repite en las tres capas: la
excepción sube intacta hasta el host. En Development, `UseDeveloperExceptionPage` muestra la
traza. En producción **no hay nada**: 500 sin cuerpo.

Y como NLog no está configurado (C-04), tampoco queda registro en el servidor.

Falta un `UseExceptionHandler` que devuelva un cuerpo de error consistente y registre el
detalle del lado del servidor.

### 🟡 C-10 · El único test no puede pasar — **corregido**

`sisgapo-api/Test/UnitTest1.cs`:

```csharp
var expected = new ResultEntity { nIdRol = 1, Result = 1 };
var result   = loginBusiness.BusinessAlmacen(new LoginEntity {
                   sNombreUsuario = "admin", sContrasenia = "123456" });
Assert.Equal(expected, result);
```

Tres problemas:
1. `BusinessAlmacen` devuelve `object`, y en tiempo de ejecución es una `List<ResultEntity>`. Comparar una lista con un `ResultEntity` **nunca puede ser igual**.
2. `ResultEntity` es una `class` sin `Equals` sobrescrito: la comparación sería por referencia aunque los tipos coincidieran.
3. **No es un test unitario**: abre una conexión real a la base de datos de producción y depende de que exista el usuario `admin` con contraseña `123456`.

Los ocho `.spec.ts` del frontend están igual de vacíos: todos conservan el `should create`
generado por el CLI, sin adaptar.

En el estado original, la cobertura real de pruebas era **cero** en las dos puntas. Con
`sonar-project.properties` y `npm run test -- --code-coverage` configurados, la intención
estaba pero no se llegó a completar.

**Arreglo aplicado:** el proyecto `Test` forma parte de la solución y contiene 16 pruebas
unitarias. `LoginBusiness` cubre hash correcto, usuario inactivo y hash corrupto;
`UsuarioBusiness` cubre bcrypt, edición sin cambio de contraseña, delimitador, longitud
mínima, mayoría de edad y documento según tipo; el filtro de demo cubre escrituras bloqueadas y lecturas
permitidas. Las dependencias de datos se sustituyen por dobles mediante interfaces pequeñas.
Además, 12 pruebas de integración reconstruyen SQL Server y verifican Lotes, Movimientos y el
invariante del kardex. GitHub Actions compila API y frontend, ejecuta ambas suites y recoge
cobertura en cada push y pull request a `main`.

### 🟡 C-11 · El módulo Cliente parecía código muerto — **corregido: no lo era**

> **Rectificación del 24 de agosto de 2026.** Este hallazgo se escribió analizando una copia
> local del proyecto, extraída de `SISGAPO.7z`. Al recuperar los repositorios de GitHub para
> montar el monorepo quedó claro que **esa copia estaba incompleta**, y que la conclusión
> original era falsa. Se deja el texto rectificado, no borrado: el error forma parte del
> registro de la auditoría.

**Lo que decía este hallazgo:** que `ClienteController`, `ClienteBusiness` y `ClienteData`
invocaban un `USP_MNT_Clientes` inexistente, sin tabla, sin script y sin pantalla; código
muerto que reventaba al llamarlo.

**Lo que hay realmente en el repositorio:**

| Pieza | Estado en el repositorio de 2021 |
|---|---|
| `TBL_CLIENTE` | Existe — `sisgapo-web/src/scripts/TBL_CLIENTE.sql` |
| `USP_MNT_Clientes` | Existe — `sisgapo-web/src/scripts/USP_MNT_Clientes.sql`, opciones `01`–`05` |
| Capa de datos, negocio y controller | Existen |
| Pantalla Angular | Existe — `modulos/cliente/`: lista, modal y servicio |
| Declaración en `app.module.ts` | Sí |
| Ruta `/clientes` | Sí |
| Entrada de menú | Sí, con el nombre **«Tracking»** e icono `gps_fixed` |

No es un intento abandonado: es un **sexto módulo completo y enganchado**, añadido el
8 de noviembre de 2021 en los dos últimos commits del proyecto (`Tracking 08-11` en el
frontend, `Tracking-Correo-08-11` en el backend). Fue lo último que se desarrolló.

**Por qué la copia local no lo tenía:** el `.7z` de enero de 2022 no incluye ni la mitad
frontend del módulo, ni sus dos scripts SQL, ni las referencias en `app.module.ts`,
`app-routing.module.ts` y `nav-menu.component.ts`. Es un estado del proyecto anterior a
esos commits, o al que se le quitó el módulo a mano.

**La lección, que es la parte que vale:** una auditoría hecha sobre un tarball no es una
auditoría del proyecto. Lo primero que hay que hacer es recuperar el control de versiones —
y aquí se hizo al revés.

**Qué sigue afectando al módulo, ahora sí verificado:**

- `TBL_CLIENTE.sql` y `USP_MNT_Clientes.sql` llevan `USE [DB_SISGAPO]`, que Azure SQL no
  admite (el mismo fallo que C-01).
- `TBL_CLIENTE.nTelefono` es `INT` (D-07).
- No hay datos de demostración para la tabla.
- `ClienteEntity` sigue declarada como `class` sin modificador, es decir `internal`,
  mientras el resto de entidades son `public`.

**Estado actual:** el módulo **no** forma parte del árbol de trabajo — ver
`10-decisiones.md`, D-19, donde se explica por qué se dejó fuera y cómo recuperarlo en un
solo comando.

**Lo que sí era código muerto de verdad**, y se eliminó: `SISGAPO_API/WeatherForecast.cs`
(plantilla de `dotnet new webapi`), `Data/Correo.cs` (clase vacía) y `Test/Entities.cs`.

### 🔴 C-12 · Los rangos de `sOpcion` de Productos están copiados de Almacenes

`SISGAPO_API/Controllers/InventarioController.cs`

El método `CrudProductos` agrupaba las opciones así:

```csharp
if  (sOpcion == "01" || "02" || "03" || "04")   // lecturas
else if (sOpcion == "05" || "06" || "07")       // escrituras
else return null;
```

Son **los rangos de `AlmacenController`**, donde la `05` sí es una escritura. En
Productos no: la `05` es *obtener producto por id* —una lectura— y la `08` es
*eliminar/activar*.

Las consecuencias son dos operaciones muertas, no una:

- **La opción `05` devolvía siempre un 500.** Caía en la rama de escritura, que hace
  `Convert.ToString(...)` sobre una `List<EListaProductosById>` y luego `Split('|')`:
  el array queda con un solo elemento y `listaRes[1]` lanza `IndexOutOfRangeException`.
  Es decir: **abrir un producto para editarlo nunca cargó nada**.
- **La opción `08` caía en el `else`** y devolvía 204 sin llegar a la capa de negocio.
  **Eliminar un producto no hacía absolutamente nada**; la interfaz recargaba la tabla
  y el producto seguía ahí.

Verificado por HTTP antes y después del arreglo.

### 🟠 C-13 · El modal de edición de producto lee campos que la API no devuelve

`productos-modal.component.ts` precargaba así:

```typescript
this.formProducto.get("dFechaFab").setValue(value[0].dFechaFabPicker)   // no existe
this.formProducto.get("dFechaVenc").setValue(value[0].dFechaVencPicker) // no existe
this.formProducto.get("sDescripcion").setValue(value[0].sDescripcion)   // no existe
```

Ninguno de los tres campos existía en la respuesta de la opción `05`: el `SELECT` no
proyectaba `sDescripcion` y las fechas salían sin el sufijo `Picker`.

Además, `this.dFechaFab` y `this.dFechaVenc` —las variables que de verdad se envían al
guardar— solo se rellenan en el evento del *datepicker*. Editando un producto sin tocar
el calendario se enviaban vacías.

Sumado a C-12, la edición de productos estaba rota de principio a fin: no cargaba, y si
el usuario rellenaba todo a mano, igual se perdían los cambios por C-02.

**Arreglo:** la opción `05` devuelve `sDescripcion`, `nIdLote` y las fechas como
`YYYY-MM-DD`; el modal las convierte a `Date` por partes (para no desplazar el día por
zona horaria) y deja cargadas las variables de envío.

### 🟠 C-14 · Los filtros de la pantalla de Productos no filtran

`productos.component.ts` declara `fAlmacen` y `fCategoria`, y la plantilla los enlaza a
dos `<mat-select>`. Pero no había `(selectionChange)`, `fnListarProductos()` nunca leía
sus valores, y `USP_MNT_Productos` opción `03` no aceptaba parámetros.

Los dos desplegables estaban ahí desde 2021 sin hacer nada. Filtrar por almacén es de las
primeras cosas que alguien prueba en una demo de un sistema multi-almacén.

**Arreglo:** la opción `03` acepta `nIdAlmacen|nIdCategoria` con `0` = todos, igual que el
filtro por rol de Usuarios.

### 🟠 C-15 · Eliminar un producto usa el identificador equivocado

`productos.component.html` llamaba a `fnCambiarEstado(element.nIdCatProd, 0)`, pero la
opción `08` hace `UPDATE TBL_PRODUCTO ... WHERE nIdProducto = @nIdProducto`.

Es el mismo defecto de fondo que C-02: funciona *por casualidad* mientras las secuencias
`IDENTITY` de `TBL_PRODUCTO` y `TBL_CAT_PROD` vayan sincronizadas. En cuanto dejen de
estarlo, dar de baja un producto da de baja **otro**.

Estaba enmascarado por C-12: como la opción `08` ni siquiera llegaba a ejecutarse, el
identificador equivocado nunca tuvo ocasión de hacer daño.

### 🔴 C-16 · El formulario de acceso no se puede pulsar si la ventana es baja

`sisgapo-web/src/app/login/login.component.css`

Reproducible al abrir las herramientas de desarrollo del navegador: el botón **Ingresar**
y los dos campos dejan de responder al clic. Con la ventana a pantalla completa funcionan.

La causa son las tres ondas decorativas del fondo:

```css
.containerWaveBottomRight {
    right   : 0px;
    bottom  : 0px;
    position: absolute;   /* ← sin ancestro posicionado */
    width   : 40%;
}
```

`position: absolute` sin ningún ancestro posicionado ancla el elemento al **bloque
contenedor inicial**, cuya altura es la del viewport. Al abrir la consola el viewport se
encoge, la onda sube, y su caja —que es un rectángulo, aunque el dibujo sea una curva—
queda por encima del formulario e intercepta los clics.

Es un bug difícil de atribuir: no hay error en consola, el botón simplemente no hace nada,
y depende del tamaño de la ventana.

**Arreglo, por los dos lados:** `pointer-events: none` en las tres ondas —un adorno no debe
capturar un clic nunca— y `position: relative` en el contenedor del layout, para que las
ondas se anclen a él y no al viewport. Se añadió también `aria-hidden="true"`, que es lo
correcto para un elemento decorativo.

### 🟠 C-17 · La pantalla de acceso no tiene diseño para móvil

Los dos paneles estaban fijos a `width: 49%` sin ninguna media query, así que en un
teléfono el formulario quedaba comprimido en media pantalla, con el título a `4rem`
desbordando el ancho.

**Arreglo:** los paneles se apilan por debajo de 900 px, la ilustración del panel de marca
se oculta por debajo de 600 px, y los títulos escalan con `clamp()`. Se añadió además una
media query por **altura**: con menos de 620 px de alto las dos ilustraciones se ocultan,
de modo que el formulario entra sin scroll — el mismo caso que provocaba C-16.

### 🟡 C-18 · Errores silenciosos al iniciar sesión

`login.component.ts` tenía tres huecos:

- Con usuario o contraseña vacíos se llamaba igual al servidor, que respondía
  «Credenciales Incorrectas» — un mensaje engañoso cuando lo que falta es rellenar el
  formulario.
- El `else` que muestra el error solo cubría el arreglo vacío. Si el servidor devolvía una
  fila con `result = 0`, la pantalla se quedaba muda.
- Un fallo de red hacía `console.log(error)` y nada más: para el usuario, el botón no hacía
  nada.

Los tres muestran ahora un mensaje. Es el mismo patrón que C-05: **rechazar una operación
en silencio es peor que fallar**.

### 🟠 C-19 · `CategoriaData` filtra el mensaje interno de una excepción al cliente — **corregido**

`sisgapo-api/Data/CategoriaData.cs:100-109`, opciones `03`, `04` y `05`:

```csharp
try { ... msj = sResultado; }
catch (Exception ex) { msj = ex.Message; }
return msj;
```

Es el único punto de las tres capas que rompe el patrón `logger.Error(e); throw;` que
siguen todos los demás `*Data.cs` y `*Business.cs` (verificado: los siete módulos restantes
lo respetan). Dos problemas, no uno:

1. **No queda registro del fallo.** Sin `logger.Error`, un error al crear o editar una
   categoría no deja rastro en el servidor — el mismo problema que C-04 se ocupó de cerrar
   en el resto del código, reabierto aquí.
2. **El texto de la excepción viaja al cliente como si fuera la respuesta normal.**
   `InventarioController` hace `Convert.ToString(...).Split('|')` sobre lo que devuelve
   `CategoriaData`; si `ex.Message` no trae un `|`, `cod` termina siendo el mensaje de error
   completo de SQL Server (nombre de restricción, tipo de dato, lo que sea que haya fallado)
   en vez del `{cod, mensaje}` consistente que espera el frontend.

**Arreglo:** quitar el catch, o como mínimo `logger.Error(ex)` antes de relanzar, igual que
en `AlmacenData`, `LoteData`, `MovimientoData`, `ProductoData`, `UsuarioData` y `ZonaData`.

**Arreglo aplicado (6 de septiembre de 2026):** el `catch` de las opciones `03`/`04`/`05`
ahora hace `logger.Error(e); throw;`, idéntico al resto de las capas. El middleware global
convierte el fallo en el mismo `{cod, mensaje}` genérico que las demás entidades, sin
filtrar el texto de la excepción de SQL Server.

### 🟠 C-20 · `UsuarioData` y `ZonaData` no cierran la conexión SQL si hay una excepción — **corregido**

`sisgapo-api/Data/UsuarioData.cs:37-127` y `sisgapo-api/Data/ZonaData.cs:37-69,86-118`.

Ambas clases abren `SqlConnection` a mano (no vía `Conexion.cs`, que sí hace `Dispose()` en
su propio `catch`) y cierran con `conn.Close()` **solo en el camino feliz**, dentro del
mismo bloque `try`, antes del `return`:

```csharp
try
{
    ...
    SqlDataReader reader = _Command.ExecuteReader();
    while (reader.Read()) { ... }
    conn.Close();          // no se alcanza si ExecuteReader() lanza
    return lista;
}
catch (Exception ex) { logger.Error(ex); throw; }   // conn queda abierta
```

Si `ExecuteReader()` o `ExecuteNonQuery()` lanzan — SQL Server caído, timeout, lo que sea —
la conexión nunca se cierra. Con tráfico mínimo de demo el impacto es bajo, pero es un
agotamiento del *connection pool* real bajo fallos repetidos, y es la clase de cosa que un
revisor técnico nota de inmediato al comparar estos dos archivos con `Conexion.cs`, que sí
lo hace bien.

**Arreglo:** `using (SqlConnection conn = ...)` en vez de `Close()` manual, o mover el
`Close()` a un `finally`.

**Arreglo aplicado (6 de septiembre de 2026):** en `UsuarioData.LIS_UsuarioData`,
`ZonaData.LIS_ZonaData` y `ZonaData.LIS_ZonaUnicoData`, la conexión se declara fuera del
`try` y se libera en un `finally` con `conn?.Dispose()`, de modo que se cierra tanto en el
camino feliz como ante una excepción. (`ZonaData.fnEjecutarEscritura` ya usaba `using` y no
se tocó.)

### 🟠 C-21 · Los listados no avisan si falla la carga, salvo en Zona — **corregido**

En todos los módulos salvo Zona, un fallo al listar (`GET`/opción de lectura) solo hace
`console.error(...)` y ahí queda: `usuarios-list.component.ts:91-93`,
`movimientos.component.ts:149-190`, `productos.component.ts:85-106`,
`categoria.component.ts:76-77`, `lotes.component.ts:96-126`,
`almacenes-list.component.ts:94-95`. El usuario ve una tabla vacía, sin ningún indicio de
si no hay datos o si la petición falló.

`zona-list.component.ts:79-94` es la excepción: mantiene `bCargando`/`sError` y los pinta
en `zona-list.component.html:15-23`. Es el módulo más nuevo y el único que usa REST
convencional en vez del patrón `sOpcion`, y el único con estado de carga y error visible.

Para una demo pensada para enseñarse en vivo contra un backend de nivel gratuito —con
*cold start* tras inactividad—, esto importa: la primera petición después de que la API
"duerma" puede tardar o fallar, y salvo en Zona, el visitante no se entera de que fue eso y
no un sistema roto. Las operaciones de escritura sí muestran `Swal.fire` de forma
consistente en todos los módulos; el hueco es específico de la carga inicial de listados.

**Arreglo:** llevar el patrón de Zona (`bCargando`/`sError` en el componente, con su aviso
en la plantilla) al resto de listados. Es un cambio mecánico, no un rediseño.

**Arreglo aplicado (6 de septiembre de 2026):** en vez de copiar el patrón seis veces, se
extrajo a un componente compartido `app-estado-carga`
(`shared/components/estado-carga/`) con entradas `[bCargando]`, `[sError]` y `[sTextoCarga]`
y una salida `(reintentar)` que muestra un botón para reintentar la carga —útil justo ante
el *cold start*. Los seis listados (almacenes, categorías, productos, lotes,
movimientos/kardex y usuarios) lo usan y ocultan la tabla mientras cargan o si hay error.
La tabla se oculta con `[hidden]`/`.hidden` (no `*ngIf`) para no perder los `ViewChild` de
paginador y ordenación. Verificado en el build de producción.

---

## D — Deuda técnica

### 🟠 D-01 · .NET 5 está fuera de soporte — **corregido**

Fin de soporte: 8 de mayo de 2022. Sin parches de seguridad desde entonces.
Azure App Service ya no ofrece .NET 5 como pila de runtime, así que **desplegarlo en un
App Service nuevo no es posible sin publicar como *self-contained***.

La migración a .NET 8 (LTS) es el requisito técnico central del plan de migración.
Ver `07-migracion-tier-free.md`, sección 5.

### 🟠 D-02 · Angular 9 está fuera de soporte

Angular 9 salió en febrero de 2020. Fuera de soporte desde agosto de 2021.

Con una salvedad importante y verificada: **el proyecto compila hoy en Node 22** usando
`NODE_OPTIONS=--openssl-legacy-provider`. No es un bloqueante para desplegar la demo, solo
para presumir de stack moderno.

También hay un desajuste de versiones: `@ng-bootstrap/ng-bootstrap` 6.2.0 está diseñado para
Bootstrap 4, pero el proyecto trae Bootstrap 5.0.2. Y conviven tres sistemas de estilos
—Angular Material, Bootstrap y CSS propio— lo que explica varias inconsistencias visuales.

### 🟠 D-03 · Sin inyección de dependencias — **parcialmente corregido**

`Startup.ConfigureServices` registra solo CORS, controllers y Swagger. Todo lo propio se
instancia con `new` en campos de instancia:

```csharp
private readonly AlmacenBusiness objInventario = new AlmacenBusiness();   // Controller
private readonly AlmacenData     almacenData   = new AlmacenData();       // Business
public AlmacenData() { oCon = new Conexion(1); }                          // Data
```

Consecuencias en cadena:
- La mayor parte de la capa de negocio todavía no se puede probar con dobles.
- **La configuración se relee del disco en cada request**: `Conexion` construye un `ConfigurationBuilder` y parsea `appsettings.json` en cada instanciación (D-04).
- No se puede sustituir una implementación sin recompilar.

Es la mejora con mejor relación esfuerzo/beneficio del backend: ~15 líneas en `Startup` más
cambiar constructores. Ver `09-mejoras-propuestas.md`, M-03.

**Avance aplicado:** `ILoginData` e `IUsuarioData` permiten probar las dos clases de negocio
priorizadas sin conexión real. Los controllers y las demás áreas todavía requieren una
adopción completa del contenedor de dependencias.

**Precisión del 6 de septiembre de 2026.** Esas dos interfaces nunca pasan por
`Startup.ConfigureServices` — no hay un solo `AddScoped`/`AddSingleton`/`AddTransient` para
Business o Data en todo el proyecto. En producción, `LoginBusiness` y `UsuarioBusiness`
siguen resolviendo su dependencia con `new LoginData()`/`new UsuarioData()` en el
constructor; las interfaces solo se usan para inyectar dobles en `Test/`. Esto no cambia el
hallazgo, pero conviene saberlo antes de "arreglar" D-03 de verdad: `AlmacenData.cs:26-27`
y `ProductoData.cs:26` guardan sus listas de resultado (`listaAlmacenes`, `listaAlmacenId`,
`listaProductos`) como **campos de instancia**, no variables locales. Hoy no hay fuga
porque cada request crea su propia cadena `new Controller → new Business → new Data`
(transient de facto). Pero si el paso siguiente es registrar esas clases con lifetime
`Scoped` o `Singleton` en el contenedor —el arreglo natural de D-03—, esos campos
acumularían resultados de requests anteriores sin que nadie toque esa línea. Vale la pena
convertirlos en variables locales en el mismo cambio que introduzca DI real.

**Avance colateral (6 de septiembre de 2026).** `Conexion` ya no resuelve la cadena de
conexión en el constructor, sino al ejecutar. Salió al escribir la prueba de controller de
D-12: construir un `InventarioController` disparaba
`new CategoriaBusiness() → new CategoriaData() → new Conexion(1)`, y eso exigía una cadena
de conexión configurada **para instanciar un objeto que en esa prueba nunca toca la base**.
Con la cadena resuelta al usarla, el controller se puede construir sin configuración y el
fallo por configuración ausente aparece donde corresponde: en la primera consulta. No
sustituye a DI real, pero quita el obstáculo que impedía probar un controller.

### 🟠 D-04 · La configuración se lee del disco en cada petición

```csharp
public Conexion(Int32 idDatabase)
{
    var builder = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
    oSqlConnIN = builder.Build()["ConnectionStrings:connectionString"];
}
```

Se ejecuta en cada `new Conexion(1)`, es decir en cada request. `UsuarioData` y `ZonaData`
duplican la misma lógica en su propio método `ConfConexion()`, sin usar `Conexion` en
absoluto.

Además `optional: true` significa que **si falta el archivo, no falla**: `oSqlConnIN` queda
`null` y el error aparece después, como un `NullReferenceException` sin relación aparente
con la causa.

Y el parámetro `idDatabase` sugiere soporte multi-base que no existe: solo se contempla el
valor `1`; con cualquier otro, la conexión queda nula en silencio.

### 🟡 D-05 · Consulta innecesaria de metadatos en cada escritura

`Conexion.EjecutarEscalar` llama a `ObtenerParametros()` antes de cada escritura, que a su vez
ejecuta el procedimiento de sistema **no documentado** `sp_procedure_params_rowset` para
descubrir la firma del procedimiento en tiempo de ejecución.

Son **dos viajes a la base de datos por cada escritura**, y el método `f_obtenerSQLType`
existe solo para traducir los nombres de tipo devueltos —lanzando una excepción con los
tipos que no contempla (`uniqueidentifier`, `date`, `datetime2`, `money`…).

Todo esto para descubrir algo que ya se sabe: **los seis procedimientos tienen la misma firma**,
`(@sOpcion VARCHAR(2), @pParametro VARCHAR(MAX))`. Y `UsuarioData` lo demuestra: pasa los dos
parámetros explícitamente y funciona igual.

Eliminarlo quita ~120 de las 253 líneas de `Conexion.cs` y la mitad de las llamadas a la base
de datos. Ver `09-mejoras-propuestas.md`, M-03.

### 🟡 D-06 · Los precios son `INT` — **corregido**

`TBL_DET_PRODUCTO.nPrecio INT`, y `EListaProductos.nPrecio` es `int` en C#.
**No se pueden representar céntimos.** En un sistema de inventario con precios, eso es una
limitación funcional, no solo estética.

Debería ser `DECIMAL(10,2)` en la base y `decimal` en C#.

**Arreglo aplicado (6 de septiembre de 2026).** El cambio recorre las cuatro capas:

| Capa | Cambio |
|---|---|
| `sql/01-esquema.sql` | `nPrecio DECIMAL(10,2)`, más `CK_DETPROD_PRECIO CHECK (nPrecio >= 0)` junto a la de cantidad |
| `sql/07-usp-productos.sql`, `sql/11-usp-lotes.sql` | `@nPrecioUnitario` y `@nPrecio` declarados `DECIMAL(10,2)` |
| `sql/03-seed.sql` | los 33 precios llevan céntimos reales (`38.50`, `2.75`, `950.00`), que es lo que hace visible el arreglo |
| `Entity` | `EListaLotes.nPrecio`, `EListaLotesById.nPrecio` a `decimal`; `EListaProductos.nValor` y los tres `nValor` de `PanelEntity`, de `long` a `decimal` |
| `Data` | `Int32.Parse(...)` / `Int64.Parse(...)` sobre esas columnas, a `Convert.ToDecimal(...)` |
| Frontend | los importes se muestran con `number:'1.2-2'` en Productos, Lotes y el panel; los dos campos de precio son `step="0.01"` y `min="0"` |

El valor del inventario de la demo pasa de `81976` a `84616.90`, y ese es el número que
documenta ahora `sql/README.md`. El bloque de invariantes del seed imprime el valor en una
consulta aparte: al ser `DECIMAL`, en el `UNION ALL` arrastraba a los conteos a su tipo y
los sacaba como `21.00`.

### 🟡 D-07 · Los teléfonos son `INT` — **corregido**

`TBL_USUARIO.nTelefono INT`, con `UsuarioData` haciendo `Convert.ToInt32(reader["nTelefono"])`.

Un `INT` no admite ceros a la izquierda, ni prefijos internacionales (`+51`), ni separadores,
ni extensiones. Un número peruano de nueve dígitos entra justo, pero `+51 987 654 321` como
número no cabe en un `INT` de 32 bits.

Los números de teléfono son identificadores, no cantidades: siempre `VARCHAR`.

**Arreglo aplicado (6 de septiembre de 2026).** La columna pasa a `sTelefono VARCHAR(20)`
—con el prefijo `s`, que es lo que exige la notación del proyecto para una cadena— y con
ella el parámetro `@sTelefono` de `USP_MNT_Usuarios`, `EntListaUsuarioId.sTelefono` en C#
y `UsuarioDetalle.sTelefono` en el frontend. El campo del formulario deja de ser
`type="number"` y pasa a `type="tel"`.

Cambiar el tipo sin cambiar la validación habría sido cosmético, así que la regla se amplía
en las dos capas a la vez: `UsuarioBusiness` y `usuarios-modal.component.ts` aceptan ahora
`^(\+51)?9\d{8}$` sobre el valor sin espacios ni guiones. El frontend normaliza antes de
enviar. Verificado contra la API: `+51987000111` se guarda y se devuelve tal cual.

### 🟡 D-08 · Duplicación alta y entidades vacías

- Los seis controllers repiten el mismo esqueleto `if/else if/try/catch`, cambiando solo el rango de códigos.
- Los siete `*Business.cs` son idénticos salvo el nombre del tipo.
- Cada `*Data.cs` repite el bloque `while (dr.Read()) { new Entidad(); …; lista.Add(); }` una vez por opción.
- Cinco clases de `Entity` están completamente vacías: `AlmacenEntity`, `CategoriaEntity`, `ClienteEntity`, `ProductoEntity` y `Test/Entities.cs`. Existen solo porque el archivo lleva su nombre; las clases reales son las `ELista*` / `EntLista*` declaradas debajo.
- `UsuarioEntity` y `GeneralEntity` son idénticas (ambas: `sOpcion` + `pParametro`), y conviven con `EntRequestUsuario`, que tiene solo `sOpcion`. Tres DTOs para lo mismo.

Un genérico `CrudController<T>` y un mapeador por convención dejarían el backend en menos de
la mitad de líneas. Para una demo no es prioritario, pero es lo que más llama la atención al
leer el código.

**Arreglo parcial (6 de septiembre de 2026).** Se cierra la mitad barata, que es la que se
lee como descuido:

- Fuera las cuatro clases marcador vacías que quedaban —`AlmacenEntity`, `CategoriaEntity`,
  `ProductoEntity` y `LoteEntity`—. Los archivos siguen ahí porque las clases reales
  (`ELista*` / `EntLista*`) viven dentro; lo que desaparece es la clase homónima vacía.
  (`ClienteEntity` y `Test/Entities.cs` ya se habían ido con D-09.)
- Fuera `UsuarioEntity` y `EntRequestUsuario`: eran copias de `GeneralEntity`. `UsuarioController`,
  `UsuarioBusiness`, `UsuarioData`, `IUsuarioData` y las pruebas usan ahora `GeneralEntity`,
  y `DemoSoloLecturaFilter` pierde el `.Concat(...OfType<UsuarioEntity>())` que existía solo
  para cubrir el duplicado. Tres DTO para lo mismo pasan a ser uno.

**Lo que sigue descartado:** el `CrudController<T>` genérico y el mapeador por convención.
Reescribirían los seis controllers y los siete `*Business` de golpe, y la regla 2 de
`CLAUDE.md` —cambios mínimos, esto es una demo— pesa más que la reducción de líneas.

### 🟡 D-09 · Restos de andamiaje y archivos generados

- `SISGAPO_API/WeatherForecast.cs` — plantilla de `dotnet new webapi`, sin usar.
- `Data/Correo.cs` — clase vacía; la lógica de correo quedó comentada dentro de `ProductoData`.
- `Test/Entities.cs` — clase vacía.
- `Microsoft.EntityFrameworkCore.SqlServer` 5.0.1 y `Microsoft.EntityFrameworkCore.Tools` referenciados, más un manifiesto `dotnet-tools.json` con `dotnet-ef` 6.0.1. **EF Core no se usa en ninguna parte**: no hay `DbContext`, ni `DbSet`, ni migraciones.
- `Microsoft.AspNet.WebApi.Cors` 5.2.7 — paquete de .NET Framework que no hace nada en ASP.NET Core; genera tres de los `NU1701`.
- `e2e/` con Protractor configurado y sin tests reales.
- Dos workflows de GitHub Actions apuntando a **dos** recursos distintos de Static Web Apps, con `output_location` diferente (`dist` y `dist/SISGAPO-Front`). Uno de los dos está mal: el `outputPath` de `angular.json` es `dist/SISGAPO-Front`.
- `.sonarqube/` y `.vs/` versionados en el repositorio.

Limpiar esto son 20 minutos y quita ruido de la primera impresión.

### 🟡 D-10 · Todo el backend es síncrono — **corregido**

Ni un `async`/`await`/`Task<T>` en `Business/*.cs` ni en `Data/*.cs` (verificado sobre las
tres capas y los siete controllers; las únicas apariciones de `async`/`Task` en todo el
proyecto son el callback del *rate limiter* en `Startup.cs` y `DemoSoloLecturaFilter`, que
implementa `IAsyncActionFilter` porque lo exige la interfaz de MVC, sin I/O real dentro).
No hay `.Result` ni `.Wait()` porque no hay nada asíncrono que esperar mal. Cada request
bloquea un hilo del *thread pool* mientras espera a SQL Server. Para el tráfico de una demo
no se nota; si este backend se reutilizara para algo con más carga concurrente, sí.

**Arreglo aplicado (6 de septiembre de 2026).** Las tres capas son asíncronas de punta a
punta, sin `.Result` ni `.Wait()` en ninguna:

- `Conexion.ejecutarDataReader` y `Conexion.EjecutarEscalar` pasan a
  `fnEjecutarDataReaderAsync` y `fnEjecutarEscalarAsync`, con `await conn.OpenAsync()`,
  `await oCmd.ExecuteReaderAsync(...)` y `await oCmd.ExecuteScalarAsync()`.
- Los nueve `*Data.cs` devuelven `Task<...>`. Los que leen por `Conexion` cambian
  `using (IDataReader dr = ...)` por `using (SqlDataReader dr = await ...)` y
  `while (dr.Read())` por `while (await dr.ReadAsync())`; `UsuarioData` y `ZonaData`, que
  abren su propia `SqlConnection`, usan `OpenAsync`, `ExecuteReaderAsync`,
  `ExecuteNonQueryAsync` y `ExecuteScalarAsync`.
- Los nueve `*Business.cs` y los seis controllers devuelven `Task<T>` /
  `Task<IActionResult>` y esperan la capa de abajo.
- Las pruebas que llaman a Business son `async Task`; los dobles de `ILoginData` e
  `IUsuarioData` devuelven `Task.FromResult(...)`, y las que comprobaban un rechazo pasan
  de `Assert.Throws` a `await Assert.ThrowsAsync`.

Compila con 0 avisos y las 38 pruebas —26 unitarias y 12 de integración— pasan contra SQL
Server 2022 en Docker. Comprobado además por HTTP contra la API local: acceso, panel,
listados, alta de producto y registro de movimiento.

### 🟡 D-11 · Los DTOs no validan nada por sí mismos, y dos controllers no comprueban un body nulo — **corregido**

Ningún archivo de `Entity/` lleva una Data Annotation (`[Required]`, `[MaxLength]`,
`[Range]`...), y `Nullable` no está activado en ningún `.csproj` del backend. Los
controllers llevan `[ApiController]` — que en teoría dispara un 400 automático si
`ModelState` queda inválido—, pero como no hay atributos que validar, esa protección está
presente en el código y nunca se activa. Es una decisión consistente en todo el backend, no
un olvido puntual: toda la validación real vive en el stored procedure (unicidad, D-31) o a
mano en `Business/UsuarioBusiness.cs:78-130` (DNI, teléfono, edad, contraseña, sobre el
string separado por `|`). `ZonaController.cs:58,84,86` es el único que valida algo —
`String.IsNullOrWhiteSpace`— antes de llamar a Business.

Consecuencia concreta de no tener ni siquiera un guard de nulos: `AlmacenController.cs:29`,
`InventarioController.cs:35` y `UsuarioController.cs:26` no comprueban que el body
deserializado no sea `null` antes de leer `.sOpcion`. Un `null` literal como body produce
`NullReferenceException`, que el middleware global convierte en un 500 genérico en vez de
un 400 con mensaje claro. `PanelController` y `ZonaController` sí cubren ese caso. Bajo
impacto para una demo —nadie manda un body `null` por accidente—, pero es la clase de
inconsistencia que salta al comparar dos controllers uno al lado del otro.

**Arreglo aplicado (6 de septiembre de 2026).** Dos piezas, porque el guard solo cubría la
mitad del hallazgo:

1. **El guard de nulos** está ahora en las siete acciones que reciben un cuerpo —Almacén,
   los cuatro `Crud*` de Inventario, Usuarios y Login—, con el mismo `BadRequest(new { cod,
   mensaje })` que ya usaban Panel y Zona.
2. **Las anotaciones existen y sirven.** `GeneralEntity.sOpcion` lleva `[Required]` y
   `[RegularExpression(@"^\d{2}$")]`; `LoginEntity` exige usuario y contraseña;
   `ZonaEntity.sNombre` es `[Required]` con `[MaxLength(100)]`. Para que ese 400 automático
   no rompiera el contrato, `Startup` configura
   `ApiBehaviorOptions.InvalidModelStateResponseFactory` para que devuelva el mismo
   `{cod, mensaje}` de siempre en vez del `ValidationProblemDetails` por defecto: el
   frontend no distingue de dónde viene el error. Las dos comprobaciones manuales de
   `String.IsNullOrWhiteSpace(sNombre)` de `ZonaController` se retiran porque la anotación
   emite ese mismo mensaje y quedarían inalcanzables.

Comprobado por HTTP:

```
{"parametros":["0"]}   → 400 {"cod":"0","mensaje":"Falta sOpcion."}
{"sOpcion":"abc"}      → 400 {"cod":"0","mensaje":"sOpcion son dos digitos."}
{"sNombre":"   "}      → 400 {"cod":"0","mensaje":"El nombre de la zona es obligatorio."}
null                   → 400 {"cod":"0","mensaje":"A non-empty request body is required."}
```

### 🟡 D-12 · Una regla de autorización vive escondida en una posición del array de parámetros — **corregido**

`sisgapo-api/SISGAPO_API/Controllers/InventarioController.cs:250,285-293`:

```csharp
if (fnEsAjuste(genEnt) && !User.IsInRole("1") && !User.IsInRole("2"))
    return Forbid();
...
private static bool fnEsAjuste(GeneralEntity genEnt) =>
    genEnt.parametros?.Length >= 2 && genEnt.parametros[1]?.Trim() == "A";
```

El control de que solo Administrador o Supervisor puedan hacer un ajuste de inventario
funciona hoy, y está bien puesto del lado del servidor (no es el hueco de D-29, que es
sobre *quién firma* un movimiento, no sobre *qué lo autoriza*). Pero decide algo tan
sensible como un chequeo de rol **leyendo una posición concreta de un array por
convención**: si el frontend cambiara el orden de `parametros` o el código de tipo de
movimiento, el check se rompe en silencio y cualquier rol autenticado podría hacer un
ajuste de existencia sin que ninguna prueba lo detecte — no hay un test que cubra este
`fnEsAjuste`.

**Arreglo aplicado (6 de septiembre de 2026).** La regla sale del controller y pasa a
`SISGAPO_API/Seguridad/PoliticaMovimiento.cs`, con los códigos declarados en
`Entity/MovimientoTipo.cs`:

```csharp
public static class TipoMovimiento
{
    public const string Entrada = "E";
    public const string Salida  = "S";
    public const string Ajuste  = "A";
    public const int    nPosicion = 2;
}
```

`InventarioController` queda con una sola línea legible —
`if (!PoliticaMovimiento.fnPuedeRegistrar(User, genEnt.parametros)) return Forbid();`— y
la posición mágica vive en una constante que apunta a las otras dos capas donde el mismo
orden está fijado (`movimientos-modal.component.ts` y `USP_MNT_Movimientos`).

Y ya no es una regla sin prueba: `Test/PoliticaMovimientoTests.cs` cubre los tres tipos de
movimiento, los tres roles, el array corto o nulo, y un caso a nivel de controller que
comprueba el `ForbidResult` para el Asistente. Confirmado también por HTTP contra la API:
un ajuste con el token de `demo.asistente` responde 403 y una salida con el mismo token
responde 200.

### 🟡 D-13 · El frontend no tiene *lazy loading*: un solo bundle de ~1,17 MB

`sisgapo-web/src/app/app-routing.module.ts` declara todas las rutas con `component:`
directo — sin un solo `loadChildren` — y los 15 componentes viven en las `declarations` de
un único `AppModule`. Verificado corriendo el build de producción real
(`NODE_OPTIONS=--openssl-legacy-provider npx ng build --prod`):

| Archivo | Tamaño |
|---|---|
| `main.js` | 1010 kB |
| `styles.css` | 123 kB |
| `polyfills.js` | 36,8 kB |
| `runtime.js` | 1,45 kB |

Es grande para lo que hace la app, pero el motivo es conocido: Angular Material completo +
Bootstrap 5 + SweetAlert2, todo en un solo *chunk* porque no hay separación por rutas.
Para una demo de un usuario navegando pocas pantallas el impacto real es bajo, pero es la
ausencia de *code splitting* más comentada en cualquier revisión de un proyecto Angular.
Ya estaba anotado como pendiente en la sección de Rendimiento de este documento; queda
formalizado aquí como hallazgo.

**Arreglo:** partir `app-routing.module.ts` con `loadChildren` por módulo funcional
(zonas, almacenes, inventario, usuarios) — es la mejora de rendimiento más grande que queda
y también la más invasiva, así que no es de una tarde.

**No se hizo en la tanda del 6 de septiembre de 2026, a propósito.** Partir el `AppModule`
obliga a crear un `SharedModule` con los ~15 módulos de Angular Material que hoy están
declarados una sola vez, y a repartir los 15 componentes y sus diálogos entre cuatro
módulos funcionales. Es un cambio que se rompe en silencio —un módulo de Material que falta
en una rama solo se nota abriendo esa pantalla—, y verificarlo pide recorrer la aplicación
entera a mano. Con la demo ya publicada, el riesgo de dejar una pantalla rota no lo
compensan 1 MB que el visitante descarga una vez.

### 🟡 D-14 · Ningún componente usa `OnPush`

Los 15 componentes corren en modo de detección de cambios `Default` (verificado por
búsqueda global de `ChangeDetectionStrategy` en `src/app`). Con `MatTableDataSource` y
formularios reactivos de por medio, Angular revisa el árbol completo en cada evento. No se
detectó ningún caso agravante (función o *getter* llamado directo desde una plantilla que
recalcule algo costoso en cada ciclo) — es deuda técnica de manual, no un problema de
rendimiento medido.

**Arreglo:** `ChangeDetectionStrategy.OnPush` en los componentes de listado, que son los
que renderizan tablas grandes; no hace falta tocar los modales.

**No se hizo en la tanda del 6 de septiembre de 2026, a propósito.** El detalle que el
hallazgo no decía: los seis listados cargan sus datos con `await` y luego asignan campos
del componente. Bajo `OnPush`, esa asignación ocurre **después** del evento que la disparó,
así que Angular no vuelve a revisar la vista y la tabla se queda vacía salvo que se llame a
`ChangeDetectorRef.markForCheck()` en cada punto de carga —unos dieciocho, contando los
reintentos de `app-estado-carga`—. Cambiar eso a ciegas puede dejar un listado en blanco en
la demo pública, y el propio hallazgo reconoce que aquí no hay un problema de rendimiento
medido. Queda pendiente con esa condición apuntada: el arreglo no es la anotación, es la
anotación **más** los `markForCheck`.

### 🟡 D-15 · `movimientos.component.ts` mezcla tabla, filtros y cálculo de fechas en 371 líneas — **corregido**

`sisgapo-web/src/app/modulos/inventario/movimientos/movimientos.component.ts` es el
componente más largo del frontend — el resto está entre 95 y 247 líneas, dentro de lo
razonable. Además del filtrado de tabla habitual, calcula a mano la agrupación por día para
la vista "cronología" (`fnAgruparPorDia`, `fnEtiquetaFecha`, líneas 301-352) y el
formateo de fechas (`fnFechaIso`). Es cálculo de presentación puro — candidato real a un
`pipe` o un service pequeño, no a quedarse en el componente.

**Arreglo aplicado (6 de septiembre de 2026).** `fnAgruparPorDia`, `fnEtiquetaFecha` y las
tablas `DIAS_SEMANA` / `MESES` salen a
`modulos/inventario/movimientos/kardex-cronologia.service.ts`, junto con las interfaces
`DiaKardex` y `MovimientoKardex`, que solo existían para esa vista. El componente conserva
un método de tres líneas que llama al service y reinicia el contador de tandas.

Se eligió un service sin estado y no un pipe: el resultado depende de la fecha de hoy
(«Hoy ·», «Ayer ·»), y un pipe puro con esa entrada mentiría sobre su pureza. El componente
baja de 378 a 311 líneas, dentro del rango del resto del frontend.

---

## Rendimiento — medido antes y despues

Lo de esta seccion se midio ejecutandolo, no se estimo.

| Metrica | Antes | Despues | Cambio |
|---|---|---|---|
| CSS que bloquea el primer render | 213 KB | 117 KB | **-96 KB** |
| JS que descarga un navegador moderno | 935 KB | 935 KB | sin cambio |
| Artefacto total del build de produccion | 2,4 MB | 1,1 MB | **-54 %** |
| Tiempo de `ng build --prod` | 36 s | 25 s | **-31 %** |
| Avisos de compilacion del backend | 12 | 2 | **-83 %** |
| Viajes a la base de datos por escritura | 2 | 1 | **-50 %** |

**Que se cambio y por que funciona:**

1. **Una llamada a la base por escritura, no dos.** `Conexion.EjecutarEscalar` ejecutaba
   `sp_procedure_params_rowset` antes de cada escritura para descubrir la firma del
   procedimiento en tiempo de ejecucion, sin cache. Esa firma se conoce en tiempo de
   compilacion: ahora esta declarada en un diccionario. Es la unica mejora de esta lista
   que afecta a la latencia de una operacion real.

2. **Bootstrap completo, a solo *reboot* + *grid*.** La aplicacion usa exactamente ocho
   clases de Bootstrap: `row`, `col-md-{1,2,3,5,6,12}` y `justify-content-center`. Se
   comprobo extrayendo todas las clases de las plantillas y cruzandolas con las que define
   cada archivo de Bootstrap: no se pierde ninguna. Son 96 KB menos de CSS bloqueante, que
   es justo lo que retrasa la primera pintura.

3. **Fuera los bundles ES5.** El criterio `> 0.5 %` de cuota global metia en la lista de
   objetivos a UC Browser, Baidu y Opera Mobile, que no soportan modulos ES2015. Mientras
   estuvieran, Angular generaba un segundo juego completo de bundles —`main-es5` de
   1.039 KB mas `polyfills-es5` de 130 KB— que **ningun navegador moderno descarga**: la
   carga diferencial los sirve solo con `<script nomodule>`.
   Conviene ser preciso con lo que esto mejora: **no reduce lo que descarga un visitante**;
   reduce el artefacto a la mitad y el tiempo de compilacion en un tercio. Revertirlo es
   quitar cinco lineas de `browserslist`.

4. **Se elimino `Microsoft.ApplicationBlocks.Data`.** Era el *SqlHelper* del Data Access
   Application Block, de alrededor de 2005: un ensamblado solo para .NET Framework. Como
   `Conexion.cs` era su unico consumidor, reescribirlo con ADO.NET plano lo saca del
   proyecto entero, y con el seis avisos `NU1701`.

5. **`System.Data.SqlClient` a `Microsoft.Data.SqlClient` 5.1.6.** Es el paquete sucesor y
   mantiene la API; el cambio fueron tres `using`. Elimina los avisos `NU1902` y `NU1903`.
   Ojo con el cambio de comportamiento: desde la version 4 el cifrado esta activado por
   defecto, asi que la cadena de conexion necesita `TrustServerCertificate=True` contra un
   SQL Server local con certificado autofirmado.

6. **Presupuestos de tamano en `angular.json`.** El build avisa si el bundle inicial pasa
   de 1,1 MB. No arregla nada por si solo; hace visible la proxima regresion.

`TBL_LOTE.dFechaVenc` ya tiene índice: el panel lo filtra en tres de sus cuatro consultas y
la pantalla de Lotes ordena por él. Se añadió con el módulo de Lotes, junto a los de
`TBL_DET_PRODUCTO.nIdLote` y los dos de `TBL_MOVIMIENTO`.

**Lo que queda sobre la mesa, por orden de retorno:**

- **Carga diferida por modulo.** El bundle inicial son 898 KB de JavaScript porque los 15
  componentes se declaran en un unico `NgModule`. Partirlo con `loadChildren` dejaria la
  pantalla de acceso en una fraccion de eso. Es la mejora de rendimiento mas grande que
  queda, y tambien la mas invasiva.
- **`OnPush` en los componentes de lista**, que hoy usan deteccion de cambios por defecto
  con `MatTableDataSource`.
- **`caniuse-lite` esta desactualizado** y el build lo avisa. Actualizarlo toca el archivo
  de bloqueo de dependencias, asi que conviene hacerlo en un cambio aparte.

---

## Orden de ataque sugerido

Si solo vas a hacer una parte, este es el orden por retorno:

| Paso | Hallazgos | Esfuerzo | Por qué primero |
|---|---|---|---|
| 1 | C-01 | Hecho — `sql/` | Sin base de datos no hay nada |
| 2 | S-01 | 30 min | Bloquea publicar en GitHub |
| 3 | D-01 | 3–4 h | Bloquea desplegar en tier gratuito |
| 4 | C-02, C-03 | 2 h | Son los bugs que el cliente va a encontrar probando |
| 5 | S-02 | 2 h | Es lo primero que mira un revisor técnico |
| 6 | S-03, S-04 | 4–6 h | Convierte "sistema roto" en "sistema real" |
| 7 | C-04, C-09 | 1 h | Sin esto no puedes diagnosticar nada de lo anterior |
| 8 | D-09 | 20 min | Quita ruido de la primera impresión |

Los pasos 1–5 son un fin de semana y cubren los ocho bloqueantes.
El plan que se siguió está resumido en `07-migracion-tier-free.md`, sección 6.

### Ahora que la demo es pública (6 de septiembre de 2026)

Con el frontend ya apuntando a la API real, el orden cambia: ninguno de los pendientes de
esta tanda es bloqueante en el sentido de "sistema roto", pero S-11 sí puede arruinar la
demo para el segundo visitante del día.

| Paso | Hallazgos | Esfuerzo | Por qué primero |
|---|---|---|---|
| 1 | S-11 | 10 min | Verificar `Demo__SoloLectura=true` en Azure — sin esto, cualquiera con la contraseña pública de demo puede alterar lo que ve el siguiente visitante |
| 2 | C-21 | 1–2 h | Sin esto, un *cold start* del tier gratuito se ve como "el sistema no funciona" en vivo |
| 3 | C-19, C-20 | 1 h | Las nota un revisor que lea `Data/` en diagonal |
| 4 | D-12 | 30 min | Barato, y quita una regla de seguridad implícita sin test |
| 5 | D-11, D-13, D-14, D-15, D-10 | Opcional | Deuda técnica real, pero ninguna cambia lo que un visitante ve o hace |

Los pasos 2, 3 y 4 están hechos, y del 5 quedan solo D-13 y D-14. Lo único vivo de esta
lista es el paso 1, que depende de la configuración de Azure y no de este repositorio.

### Lo que queda, después de la tanda del 6 de septiembre de 2026

| Hallazgo | Estado | Por qué sigue abierto |
|---|---|---|
| S-11 | Depende de Azure | Reinterpretado: el control es el reinicio periódico del seed (`11-estado-portafolio.md`) |
| S-12 | Falta recargar la base pública | El seed ya está corregido en el repositorio |
| D-02 | Fuera de alcance | Migrar Angular 9 es un proyecto, no un arreglo |
| D-03 | Parcial | Falta DI real; hacerlo obliga a revisar los campos de instancia de `AlmacenData` y `ProductoData` |
| D-08 | Parcial | El `CrudController<T>` genérico sigue descartado por la regla de cambios mínimos |
| D-13, D-14 | Aplazados | Riesgo de romper una pantalla en silencio, sin beneficio medido |
