# 09 — Mejoras propuestas

Catálogo de mejoras más allá del alcance original de 2021. Cada una lleva esfuerzo estimado,
impacto para la demo y una recomendación explícita de **hacerla o no hacerla**.

Todo lo de aquí es **opcional**. El alcance original está completo: 12 de 12 casos de uso
implementados. Algunas mejoras son de calidad y otras amplían el producto más allá de 2021.

## Cómo leer las recomendaciones

- ✅ **Hazlo** — el retorno justifica el esfuerzo para el objetivo de demo.
- 🤔 **Depende** — bueno, pero solo si te sobra tiempo o quieres un objetivo concreto.
- ❌ **No lo hagas** — no compensa para una demo; anotado por si el contexto cambia.

## Resumen

> **Estado a 2 de septiembre de 2026.** Siete de estas mejoras ya están aplicadas total o parcialmente y
> verificadas: M-01, M-02, M-03 (parcial: `Conexion.cs` reescrito, sin inyección de
> dependencias completa), M-04, M-05, M-08, M-11 y la parte de rendimiento que no estaba en
> esta lista. El detalle de cada una, con las mediciones, está en `06-hallazgos.md`.

| # | Mejora | Esfuerzo | Demo | Portafolio | Reco. | Estado |
|---|---|---|---|---|---|---|
| M-01 | Contraseñas hasheadas | 2 h | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | **hecho** |
| M-02 | Autenticación JWT + guards | 6 h | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | **hecho** |
| M-03 | Reescribir `Conexion.cs` + DI | 3 h | ⭐⭐ | ⭐⭐⭐⭐ | ✅ | **parcial** |
| M-04 | Corregir C-02 y C-03 | 2 h | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | **hecho** |
| M-05 | Limpiar código muerto | 30 min | ⭐ | ⭐⭐⭐ | ✅ | **hecho** |
| M-06 | Sustituir `pParametro` por JSON | 2 días | ⭐ | ⭐⭐⭐⭐ | 🤔 | mitigado |
| M-07 | Actualizar Angular | 3–5 días | ⭐⭐ | ⭐⭐⭐ | ❌ | fuera del alcance |
| M-08 | Pruebas reales | 2–3 días | ⭐ | ⭐⭐⭐⭐⭐ | 🤔 | **unitarias + integración SQL** |
| M-09 | Múltiples lotes por producto | 2 días | ⭐⭐⭐ | ⭐⭐⭐ | ✅ | **hecho** |
| M-10 | Lógica de T-SQL a C# | 4–6 días | ⭐⭐ | ⭐⭐⭐⭐⭐ | 🤔 | pendiente |
| M-11 | Reportes y panel | 3 días | ⭐⭐⭐⭐ | ⭐⭐⭐ | 🤔 | **hecho** |
| M-12 | Movimientos de inventario | 4 días | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | **hecho** |
| M-13 | Módulo de proveedores (PN3) | 5 días | ⭐⭐ | ⭐⭐ | ❌ | pendiente |
| M-14 | Reescritura completa | 3–4 semanas | ⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ | pendiente |

---

## ✅ M-01 · Contraseñas hasheadas

**Resuelve:** `06-hallazgos.md`, S-02 · **Esfuerzo:** 2 h

Es la objeción más obvia y la más barata de eliminar.

```bash
dotnet add Business package BCrypt.Net-Next
```

```sql
ALTER TABLE TBL_LOGIN ALTER COLUMN sContrasenia VARCHAR(255) NOT NULL;
```

El cambio de fondo es **mover la verificación del procedimiento a C#**. Hoy
`USP_MNT_Login` compara en el `WHERE`, lo cual es imposible con hashes con sal, porque cada
hash es distinto aunque la contraseña sea la misma:

```sql
-- USP_MNT_Login: devolver el hash, no compararlo
SELECT usr.nIdUsuario, usr.nRol AS nIdRol, lgn.sContrasenia
  FROM TBL_LOGIN lgn
  INNER JOIN TBL_USUARIO usr ON usr.nIdUsuario = lgn.nIdUsuario
 WHERE lgn.sNombreUsuario = @sNombreUsuario AND usr.bEstado = 1;
```

```csharp
// LoginBusiness
var fila = loginData.ObtenerPorUsuario(logEnt.sNombreUsuario);
if (fila is null) return null;
if (!BCrypt.Net.BCrypt.Verify(logEnt.sContrasenia, fila.sContrasenia)) return null;
return new ResultEntity { Result = 1, nIdRol = fila.nIdRol };
```

Y en `USP_MNT_Usuarios` opciones `04` y `05`, guardar el hash que ya llega calculado desde C#.

**No olvides:** quitar `sContrasenia` del `SELECT *` de la opción `03`, que hoy devuelve la
contraseña al cliente.

**Para el seed:** genera los hashes de las contraseñas de demo con un script pequeño y
sustitúyelos en `sql/03-seed.sql`, dejando el comentario de cuál es la contraseña en claro
(son credenciales públicas de demostración, tiene sentido documentarlas).

Comprobación de verdad: `SELECT sContrasenia FROM TBL_LOGIN` no debe dejar leer ninguna
contraseña.

## ✅ M-02 · Autenticación JWT y control de acceso

**Resuelve:** `06-hallazgos.md`, S-03, S-04 · **Esfuerzo:** 6 h

Es el cambio que más eleva la percepción del proyecto. Hoy la API es completamente pública.

**Backend**

```csharp
// Startup.ConfigureServices
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o => o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, ValidateAudience = true,
        ValidateLifetime = true, ValidateIssuerSigningKey = true,
        ValidIssuer   = Configuration["Jwt:Issuer"],
        ValidAudience = Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(Configuration["Jwt:Key"]))
    });
```

```csharp
// Startup.Configure — el orden importa
app.UseRouting();
app.UseCors();
app.UseAuthentication();     // ← esto es lo que falta hoy
app.UseAuthorization();
app.UseEndpoints(...);
```

`LoginController` emite el token con el rol como *claim*. Los demás controllers reciben
`[Authorize]`, y donde el documento de casos de uso lo especifica, `[Authorize(Roles = "1")]`
para las operaciones de administrador.

> **La clave JWT es un secreto.** Va en `dotnet user-secrets` en local y en la configuración
> del App Service en producción — nunca en `appsettings.json` versionado. Ver
> `06-hallazgos.md`, S-01.

**Frontend**

Tres piezas: guardar el token al entrar, un interceptor que lo añada a cada petición, y un
guard que proteja las rutas.

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = localStorage.getItem('token');
    if (token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
    return next.handle(req);
  }
}
```

```typescript
// app-routing.module.ts
{ path: 'usuarios', component: UsuariosListComponent, canActivate: [AuthGuard] },
```

**Y filtra el menú por rol**, que es lo que dice la especificación y hoy no se cumple:
`listaNav` en `nav-menu.component.ts` debe excluir las entradas que el rol no puede usar, y
los componentes de lista deben ocultar los botones de acción según el rol.

Comprobación: `curl` sin token debe devolver 401, y `localStorage.setItem('Rol','1')` en la
consola ya no debe dar acceso a nada.

## ✅ M-03 · Reescribir `Conexion.cs` e introducir inyección de dependencias

> **Hecho a medias.** `Conexion.cs` ya está reescrito con ADO.NET plano: fuera el
> descubrimiento de firmas en tiempo de ejecución, fuera `Microsoft.ApplicationBlocks.Data`
> y una llamada a la base por escritura en vez de dos. `LoginBusiness` y `UsuarioBusiness`
> ya reciben interfaces de datos para poder probarse con dobles. Los controllers y el resto
> de clases de negocio siguen instanciando dependencias con `new`.

**Resuelve:** `06-hallazgos.md`, D-03, D-04, D-05, S-06 · **Esfuerzo:** 3 h

Cuatro hallazgos de una vez, y es prerrequisito de la migración a .NET 8.

El código concreto está en `07-migracion-tier-free.md` secciones 5.3 y 5.5. Resumen de lo que se
consigue:

| Antes | Después |
|---|---|
| 253 líneas en `Conexion.cs` | ~60 |
| 2 viajes a la base por escritura | 1 |
| `sp_procedure_params_rowset` (no documentado) | Parámetros explícitos |
| `Microsoft.ApplicationBlocks.Data` (2005, sin mantenimiento) | `Microsoft.Data.SqlClient` actual |
| `appsettings.json` releído en cada petición | Configuración inyectada una vez |
| Todo instanciado con `new` | Contenedor de dependencias |
| No testeable | Testeable con dobles |
| Dos formas de conectarse (`Conexion` + `SqlConnection` a mano) | Una |

Es la mejora con mejor relación esfuerzo/beneficio del backend, y la que hace posible M-08.

## ✅ M-04 · Corregir los bugs que se ven

**Resuelve:** `06-hallazgos.md`, C-02, C-03, C-08 · **Esfuerzo:** 2 h

Son los tres que un cliente encuentra probando la aplicación.

**C-02 — editar producto.** Dos cambios de una línea cada uno.

En `productos-modal.component.ts`, el frontend envía 10 valores donde el procedimiento espera 11:

```typescript
pParametro.push(this.formProducto.get("sDescripcion").value);   // 9
pParametro.push(this.formProducto.get("nIdProducto").value);    // 10  ← añadir
pParametro.push(this.formProducto.get("nIdCatProd").value);     // 11
```

En `USP_MNT_Productos` opción `07`, `@nIdLote` nunca se asigna:

```sql
SET @nIdLote = (SELECT nIdLote FROM TBL_DET_PRODUCTO WHERE nIdProducto = @nIdProducto);
```

**C-03 — editar zona.** Requiere una operación de actualización que no existe en ninguna capa:
añadir la opción `04` a `USP_MNT_Zonas`, un método en `ZonaData`, un `PUT /api/zona/{id}` en
el controller, y hacer que `zona-form.component.ts` distinga alta de edición en vez de
ejecutar `delete this.lZona.nIdZona`.

De paso, arregla la validación que nunca se ejecuta:
```typescript
if (!(await this.fnValidarImagen())) { return; }   // faltaban los paréntesis
```

**C-08 — respuestas nulas.** Sustituir el `return null` final de los seis controllers:

```csharp
return BadRequest(new { mensaje = $"sOpcion no soportada: {genEnt.sOpcion}" });
```

**Aprovecha y añade transacciones** (C-07) a `USP_MNT_Productos` opción `06` y
`USP_MNT_Usuarios` opción `04`, que son los dos sitios donde un fallo a medias deja datos
inconsistentes. Son cuatro líneas: `BEGIN TRY / BEGIN TRANSACTION / COMMIT / END TRY BEGIN
CATCH ROLLBACK`.

## ✅ M-05 · Limpiar código muerto

**Resuelve:** `06-hallazgos.md`, C-11, D-09 · **Esfuerzo:** 30 min

Media hora que cambia la primera impresión al abrir el repositorio.

Eliminar:
- `SISGAPO_API/WeatherForecast.cs` — plantilla por defecto
- `Data/Correo.cs` — clase vacía
- `Test/Entities.cs` — clase vacía
- `ClienteController.cs`, `ClienteBusiness.cs`, `ClienteData.cs`, `ClienteEntity.cs` — módulo
  histórico retirado del árbol actual; se conserva recuperable en Git
- Las cinco clases de entidad vacías (`AlmacenEntity`, `CategoriaEntity`, `ProductoEntity`…)
- El bloque de correo comentado en `ProductoData.cs` (que además contiene una contraseña)
- Paquetes de EF Core y `.config/dotnet-tools.json`
- `Microsoft.AspNet.WebApi.Cors`
- El workflow duplicado `azure-static-web-apps-blue-sea-*.yml`
- `e2e/` si no vas a escribir tests de extremo a extremo
- `.sonarqube/` y `.vs/` del repositorio, y añadirlos al `.gitignore`

Y unificar los tres DTOs equivalentes (`GeneralEntity`, `UsuarioEntity`, `EntRequestUsuario`)
en uno solo.

---

## 🤔 M-06 · Sustituir `pParametro` por JSON tipado

> **Mitigación aplicada.** El frontend ya envía un arreglo de valores y el backend rechaza
> `|` antes de reconstruir `pParametro`. Los procedimientos continúan usando `dbo.Split`,
> por lo que la sustitución completa descrita aquí sigue pendiente.

**Resuelve:** `06-hallazgos.md`, S-07 · **Esfuerzo:** 2 días

Elimina de raíz el acoplamiento posicional y el problema del delimitador sin escapar.

```jsonc
// Antes
{ "sOpcion": "05", "pParametro": "Almacén Norte|Av. Perú 123|2|1" }

// Después
POST /api/almacenes
{ "nombre": "Almacén Norte", "direccion": "Av. Perú 123", "idSupervisor": 2, "idZona": 1 }
```

**Por qué es tentador:** elimina S-07 por completo, hace útil Swagger, permite validación con
anotaciones de datos, y da errores de compilación en vez de fallos en ejecución cuando cambia
un campo.

**Por qué dudo:** hay que tocar simultáneamente el procedimiento, el `*Data.cs` y el
`*.service.ts` de cada entidad, y probar los 12 casos de uso otra vez. Y el patrón actual,
aunque malo, **es consistente**, lo que lo hace predecible.

**Recomendación:** hazlo **solo si** también vas a hacer M-10 (llevar la lógica a C#). Los dos
juntos tienen sentido como un proyecto de modernización. Por separado, M-06 es mucho trabajo
para un beneficio que el cliente no ve.

**Si lo haces:** una entidad completa a la vez —procedimiento, C# y TypeScript— antes de
empezar la siguiente. `ZonaController` ya funciona así y sirve de plantilla.

## ❌ M-07 · Actualizar Angular

**Resuelve:** `06-hallazgos.md`, D-02 · **Esfuerzo:** 3–5 días

Angular 9 → 19/20 son once versiones mayores. La ruta oficial (`ng update` versión a versión)
es lenta y con este código —que mezcla Material, Bootstrap 5 y `@ng-bootstrap` 6— probablemente
se atasque. Suele salir más rápido **crear un proyecto nuevo y portar los 14 componentes**,
que además permite empezar con componentes autónomos, señales y control de flujo moderno.

**El argumento en contra, y es fuerte:** verificamos que Angular 9 **compila hoy en Node 22**
con `--openssl-legacy-provider`. La actualización no desbloquea nada; solo mejora cómo se ve
el `package.json`.

**Decisión:** fuera del alcance. Si el objetivo fuera demostrar Angular actual, tendría más
sentido un proyecto nuevo pequeño que reescribir este trabajo histórico.

**Alternativa barata (30 min):** deja Angular 9, pero fija el flag en `package.json` con
`cross-env` para que `npm start` funcione sin trucos, y documenta por qué en el README. Eso
convierte una limitación en una decisión explicada.

## 🤔 M-08 · Pruebas de verdad

**Resuelve:** `06-hallazgos.md`, C-10 · **Esfuerzo:** 2–3 días

La suite unitaria ya está incorporada: 16 pruebas de `LoginBusiness`,
`UsuarioBusiness` y el filtro de modo demo, ejecutadas por GitHub Actions junto con la
compilación de ambas capas.
Los ocho `.spec.ts` del frontend conservan todavía el `should create` del generador.

Lo interesante es que **el andamiaje ya está montado**: xUnit configurado, Karma con
`--code-coverage`, `sonar-project.properties` y `sonar-scanner` en las dependencias. Alguien
tuvo la intención.

Las interfaces pequeñas añadidas a la capa de datos permiten usar dobles en las dos clases
priorizadas sin migrar toda la aplicación al contenedor de dependencias.

Lo que aportaría más por hora:
1. **Tests de integración de los procedimientos** contra SQL Server en contenedor (Testcontainers). Habrían detectado C-02 y C-06 automáticamente.
2. **Tests unitarios de la capa de negocio** con `Data` simulado — una vez que M-01 y M-02 pongan lógica real ahí.
3. **Un test de extremo a extremo** con Playwright que recorra login → listar → crear → editar → dar de baja.

**Hecho para los módulos nuevos:** `Test/InventarioIntegracionTests.cs` ejecuta doce pruebas
contra SQL Server —el mismo contenedor de `docker compose`— y cubre las reglas de Lotes y
Movimientos, incluido el invariante «existencia = suma del kardex». Se omiten solas si no hay
`SISGAPO_TEST_CONNECTION_STRING`, y CI las corre en un trabajo aparte.

**Lo que queda:** llevar el mismo tratamiento a los procedimientos de 2021 —Productos,
Almacenes, Usuarios—, que son los que tuvieron los bugs históricos.

## ✅ M-09 · Múltiples lotes por producto

**Esfuerzo:** 2 días

Limitación real del modelo: `TBL_DET_PRODUCTO` tenía una fila por producto y esa fila apuntaba
a un solo lote. **Un producto no podía tener dos lotes con vencimientos distintos.**

Para un sistema de gestión de almacén con control de caducidad, es justamente el caso central:
*"tengo 50 kg del lote que vence en marzo y 30 kg del que vence en junio"*.

**Qué se hizo:**

- `TBL_DET_PRODUCTO` pasa a tener una fila por producto **y lote**, con
  `UNIQUE(nIdProducto, nIdLote)` y baja lógica propia.
- Todos los lotes del producto comparten unidad de medida; el procedimiento rechaza mezclas
  que volverían inválida la existencia agregada del listado.
- `TBL_LOTE.sNombreLote` es `UNIQUE`, y el generador de códigos busca el primer correlativo
  libre en vez de contar productos con el mismo nombre.
- Procedimiento nuevo `USP_MNT_Lotes` con las seis opciones del mantenimiento, y pantalla
  propia en Angular con filtros por almacén, categoría y producto.
- El listado de productos deja de ser una foto de un lote y pasa a **resumir** los del
  producto: número de lotes, existencia total, valor y vencimiento más próximo.
- La edición de un producto se queda con nombre, almacén y categoría. Lo demás es del lote.

**Resultado:** el seed trae ocho productos con dos partidas cada uno, con vencimientos
distintos, y el panel de próximos vencimientos los distingue. Es la mejora que mejor demuestra
que el dominio se entiende, y la que hizo evidente que el modelo de 2021 no cubría el caso de
uso principal del cliente.

## 🤔 M-10 · Mover la lógica de T-SQL a C#

**Esfuerzo:** 4–6 días

La transformación de fondo: sacar las ~950 líneas de lógica de negocio de los stored
procedures y llevarlas a servicios de C#, con Dapper o EF Core para el acceso a datos.

**A favor:**
- La lógica pasa a ser testeable, depurable y versionable de verdad.
- Desaparecen `dbo.Split` y el formato `|`.
- Habilita M-08 (pruebas) por completo.
- **Deja de estar atado a SQL Server** — con la lógica en C#, cambiar a PostgreSQL o SQLite pasa a ser cuestión de horas.
- Es el cambio que mejor demuestra capacidad de modernizar sistemas heredados, que es trabajo muy solicitado.

**En contra:**
- Es una semana.
- Alto riesgo de regresión sin pruebas previas (círculo vicioso: para hacerlo con seguridad necesitas M-08, y M-08 es más fácil después de M-10).
- El cliente ve exactamente lo mismo.

**Recomendación:** 🤔 la mejor pieza técnica del catálogo, pero es un proyecto en sí mismo.
**Si lo haces, hazlo en este orden:**
1. Tests de integración de los procedimientos actuales (M-08 punto 1) — capturan el comportamiento correcto, incluidos los bugs conocidos.
2. Portar entidad por entidad, verificando contra esos tests.
3. Al terminar, migrar a SQLite y eliminar el servidor de base de datos.

Al final tendrías: la aplicación entera en un contenedor, sin base de datos que gestionar,
US$ 0 garantizado para siempre, cobertura de pruebas real, y una historia de modernización
completa que contar. Es el mejor destino posible para este proyecto — pero es una semana.

## ✅ M-11 · Reportes y panel de inicio

**Esfuerzo:** 3 días

El panel ya muestra almacenes y productos activos, valor del inventario, distribución por
categoría y almacén, y próximos vencimientos. Las consultas viven en `USP_MNT_Panel` y el
frontend usa la misma URL configurada que el resto de la aplicación.

**Resultado:** es la entrada visual de la demo y resume el estado actual. Con M-12 ya en el
sistema, lo siguiente que le falta es actividad reciente y entradas/salidas del período:
`USP_MNT_Movimientos` opción `04` ya devuelve esos totales, solo hay que traerlos al panel.

---

## ✅ M-12 · Movimientos de inventario

**Esfuerzo:** 4 días

El problema original hablaba de "entradas y salidas" y "seguimiento de despachos", pero
**ningún caso de uso lo especificaba** y el modelo no lo soportaba: no había tabla de
movimientos, solo un `nCantidad` que se sobrescribía al editar el producto.

**Qué se hizo:**

- Tabla `TBL_MOVIMIENTO`: tipo (`E` entrada, `S` salida, `A` ajuste), cantidad con signo,
  saldo resultante, motivo, usuario y fecha, con `CHECK` que impiden que una entrada reste o
  que un saldo quede en negativo.
- Procedimiento `USP_MNT_Movimientos`: kardex con filtros por almacén, producto, lote, tipo y
  rango de fechas; totales del período; y el registro del movimiento en una transacción con
  `UPDLOCK` sobre el lote.
- La existencia solo cambia aquí. Editar un producto o un lote ya no la toca.
- Un ajuste recibe la **cantidad contada** en el inventario físico, no la diferencia: el
  procedimiento calcula el delta para que quede en el kardex como entrada o salida.
- **El Asistente registra entradas y salidas; el ajuste queda para Supervisor y
  Administrador.** Es el primer caso de uso propio del rol Asistente, que hasta ahora solo
  consultaba.
- El usuario que firma el movimiento sale del token, nunca del formulario.

**Resultado:** el recorrido de la demo deja de ser un catálogo y pasa a explicar cómo cambia
el inventario: `login → panel → almacén → producto → lote → kardex`. Y el invariante
—existencia = suma del kardex— está cubierto por pruebas de integración contra SQL Server.

## ❌ M-13 · Módulo de proveedores (PN3)

**Esfuerzo:** 5 días

El proceso PN3 no forma parte de la demo actual. El módulo histórico `Cliente` llegó a tener
tabla, procedimiento, backend y pantalla, pero se dejó fuera del árbol publicado porque no
está integrado ni probado con el recorrido actual (`10-decisiones.md`, D-19).

**Recomendación:** ❌ para la demo actual. Mantenerlo en el historial evita añadir una entrada
de menú sin validar. Solo conviene restaurarlo si el objetivo cambia a cubrir abastecimiento
y se añaden datos, integración y pruebas.

## ❌ M-14 · Reescritura completa

**Esfuerzo:** 3–4 semanas

.NET 9 con arquitectura vertical, Angular 20 con señales, PostgreSQL, EF Core, tests, CI/CD
completo.

**Recomendación:** ❌ **y esta es la más importante de descartar.**

Si reescribes SISGAPO, dejas de tener SISGAPO: tienes un proyecto nuevo con nombre viejo. Y
pierdes justo lo que lo hace valioso como pieza de portafolio — que es **un sistema real de
2021, con sus decisiones de 2021, que tú sabes auditar en 2026**.

Si quieres un proyecto que demuestre stack moderno, construye uno nuevo desde cero y ten los
dos: *"aquí está lo que hice cuando empezaba, aquí está lo que hago ahora, y aquí está el
documento donde explico la diferencia"*. Esa pareja cuenta una historia mucho mejor que
cualquiera de los dos por separado.

---

## Rutas recomendadas

**Ruta mínima — 1 día.** M-04 → M-05 → migración a .NET 8 (`07-migracion-tier-free.md` fase 2).
Demo local funcionando, sin bugs visibles, US$ 0.

**Ruta recomendada — 2,5 días.** La anterior + M-01 → M-02 → M-03 + despliegue.
Demo pública con autenticación real. **Es el punto donde el retorno por hora se estabiliza.**

**Ruta lúcida — +3 días.** La anterior + M-11 (panel) + M-09 (múltiples lotes) + M-12
(movimientos y kardex). Impresiona a clientes no técnicos y demuestra que entiendes el
dominio. **Es donde está el proyecto hoy.**

**Ruta técnica — +1 semana.** La recomendada + M-08 → M-10 → SQLite.
La mejor versión posible del proyecto, y una historia de modernización completa.

Salvo que tengas un motivo concreto, **para en la ruta recomendada**. El objetivo es tener una
demo, no un producto.
