# 06 — Hallazgos

Inventario completo de problemas encontrados en el análisis. Clasificados en tres grupos:
**S** seguridad, **C** correctitud, **D** deuda técnica.

Cada hallazgo lleva una prioridad orientada al objetivo real —convertir esto en una demo
presentable—, no a un despliegue en producción:

- 🔴 **Bloqueante** — hay que arreglarlo antes de enseñar el proyecto a nadie.
- 🟠 **Importante** — un revisor técnico lo va a notar y va a preguntar.
- 🟡 **Menor** — conviene, pero no cambia la percepción del proyecto.

## Resumen

| Grupo | 🔴 | 🟠 | 🟡 | Total |
|---|---|---|---|---|
| Seguridad | 5 | 4 | 1 | 10 |
| Correctitud | 6 | 9 | 3 | 18 |
| Deuda técnica | 0 | 4 | 5 | 9 |
| **Total** | **11** | **17** | **9** | **37** |

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
| D-06 / D-07 / D-08 | ⏳ Pendiente |

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

### 🟡 D-06 · Los precios son `INT`

`TBL_DET_PRODUCTO.nPrecio INT`, y `EListaProductos.nPrecio` es `int` en C#.
**No se pueden representar céntimos.** En un sistema de inventario con precios, eso es una
limitación funcional, no solo estética.

Debería ser `DECIMAL(10,2)` en la base y `decimal` en C#.

### 🟡 D-07 · Los teléfonos son `INT`

`TBL_USUARIO.nTelefono INT`, con `UsuarioData` haciendo `Convert.ToInt32(reader["nTelefono"])`.

Un `INT` no admite ceros a la izquierda, ni prefijos internacionales (`+51`), ni separadores,
ni extensiones. Un número peruano de nueve dígitos entra justo, pero `+51 987 654 321` como
número no cabe en un `INT` de 32 bits.

Los números de teléfono son identificadores, no cantidades: siempre `VARCHAR`.

### 🟡 D-08 · Duplicación alta y entidades vacías

- Los seis controllers repiten el mismo esqueleto `if/else if/try/catch`, cambiando solo el rango de códigos.
- Los siete `*Business.cs` son idénticos salvo el nombre del tipo.
- Cada `*Data.cs` repite el bloque `while (dr.Read()) { new Entidad(); …; lista.Add(); }` una vez por opción.
- Cinco clases de `Entity` están completamente vacías: `AlmacenEntity`, `CategoriaEntity`, `ClienteEntity`, `ProductoEntity` y `Test/Entities.cs`. Existen solo porque el archivo lleva su nombre; las clases reales son las `ELista*` / `EntLista*` declaradas debajo.
- `UsuarioEntity` y `GeneralEntity` son idénticas (ambas: `sOpcion` + `pParametro`), y conviven con `EntRequestUsuario`, que tiene solo `sOpcion`. Tres DTOs para lo mismo.

Un genérico `CrudController<T>` y un mapeador por convención dejarían el backend en menos de
la mitad de líneas. Para una demo no es prioritario, pero es lo que más llama la atención al
leer el código.

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
El plan completo con calendario está en `07-migracion-tier-free.md`, sección 7.
