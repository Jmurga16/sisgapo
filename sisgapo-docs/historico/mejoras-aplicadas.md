# Mejoras aplicadas (agosto–septiembre de 2026)

Las ocho entradas de `../08-mejoras-propuestas.md` que se llegaron a hacer, con el detalle
de qué se hizo y cómo se comprobó. Se mueven aquí para que el roadmap vivo tenga solo lo
abierto. Los identificadores `S-`, `C-` y `D-` remiten a `hallazgos-2026.md`, en esta
misma carpeta.

| # | Mejora | Esfuerzo estimado | Cerrada en |
|---|---|---|---|
| M-01 | Contraseñas hasheadas | 2 h | Agosto de 2026 (S-02) |
| M-02 | Autenticación JWT + guards | 6 h | Agosto de 2026 (S-03, S-04) |
| M-03 | Reescribir `Conexion.cs` + inyección de dependencias | 3 h | Agosto (`Conexion`) y 7 de septiembre de 2026 (D-43) |
| M-04 | Corregir C-02 y C-03 | 2 h | Agosto de 2026 |
| M-05 | Limpiar código muerto | 30 min | Agosto de 2026 |
| M-09 | Múltiples lotes por producto | 2 días | Septiembre de 2026 |
| M-11 | Reportes y panel | 3 días | Agosto de 2026 |
| M-12 | Movimientos de inventario | 4 días | Septiembre de 2026 |

---

## ✅ M-01 · Contraseñas hasheadas

**Resuelve:** `hallazgos-2026.md`, S-02 · **Esfuerzo:** 2 h

Era la objeción más obvia y la más barata de eliminar.

```bash
dotnet add Business package BCrypt.Net-Next
```

```sql
ALTER TABLE TBL_LOGIN ALTER COLUMN sContrasenia VARCHAR(255) NOT NULL;
```

El cambio de fondo fue **mover la verificación del procedimiento a C#**. `USP_MNT_Login`
comparaba en el `WHERE`, lo cual es imposible con hashes con sal, porque cada hash es
distinto aunque la contraseña sea la misma:

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

Y en `USP_MNT_Usuarios` opciones `04` y `05`, guardar el hash que ya llega calculado desde
C# (`../09-decisiones.md`, D-22 y D-23).

Se quitó `sContrasenia` del `SELECT *` de la opción `03`, que devolvía la contraseña al
cliente. Los hashes de las contraseñas de demo se generaron con un script pequeño y están
en `../sql/03-seed.sql`, con el comentario de cuál es la contraseña en claro de las
cuentas `demo.*` (son credenciales públicas de demostración).

Comprobación: `SELECT sContrasenia FROM TBL_LOGIN` no deja leer ninguna contraseña.

## ✅ M-02 · Autenticación JWT y control de acceso

**Resuelve:** `hallazgos-2026.md`, S-03, S-04 · **Esfuerzo:** 6 h

Fue el cambio que más elevó la percepción del proyecto: la API era completamente pública.

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
app.UseAuthentication();     // ← esto era lo que faltaba
app.UseAuthorization();
app.UseEndpoints(...);
```

`LoginController` emite el token con el rol como *claim*. Los demás controllers llevan
`[Authorize]`, y donde el documento de casos de uso lo especifica, `[Authorize(Roles = "1")]`
para las operaciones de administrador.

> **La clave JWT es un secreto.** Va en `dotnet user-secrets` en local y en la configuración
> del servicio en producción — nunca en `appsettings.json` versionado. Ver
> `hallazgos-2026.md`, S-01.

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

**Y el menú se filtra por rol**, que es lo que dice la especificación y no se cumplía:
`listaNav` en `nav-menu.component.ts` excluye las entradas que el rol no puede usar, y los
componentes de lista ocultan los botones de acción según el rol.

Comprobación: `curl` sin token devuelve 401, y `localStorage.setItem('Rol','1')` en la
consola ya no da acceso a nada.

## ✅ M-03 · Reescribir `Conexion.cs` e introducir inyección de dependencias

**Resuelve:** `hallazgos-2026.md`, D-03, D-04, D-05, S-06 · **Esfuerzo:** 3 h

Cuatro hallazgos de una vez, y prerrequisito de la migración a .NET 8. Se hizo en dos
tandas: `Conexion.cs` reescrito con ADO.NET plano en agosto, y el contenedor de
dependencias completo el 7 de septiembre (`../09-decisiones.md`, D-43).

| Antes | Después |
|---|---|
| 253 líneas en `Conexion.cs` | ~200, sin descubrimiento de firmas |
| 2 viajes a la base por escritura | 1 |
| `sp_procedure_params_rowset` (no documentado) | Parámetros explícitos, declarados en un diccionario |
| `Microsoft.ApplicationBlocks.Data` (2005, sin mantenimiento) | `Microsoft.Data.SqlClient` actual |
| `appsettings.json` releído en cada petición | Configuración resuelta una vez (`Lazy`) |
| Todo instanciado con `new` | Nueve `Data` y nueve `Business` registradas como `Scoped`; los controladores las reciben por constructor |
| No testeable | Testeable con dobles: 26 pruebas unitarias |

Lo que quedó fuera, a propósito o por falta de tanda: `UsuarioData` y `ZonaData` siguen
abriendo su propia `SqlConnection` en vez de pasar por `Conexion` (es H-09 en
`../11-auditoria-y-cierre.md`), y la configuración sigue en clases estáticas (MC-03).

## ✅ M-04 · Corregir los bugs que se ven

**Resuelve:** `hallazgos-2026.md`, C-02, C-03, C-08 · **Esfuerzo:** 2 h

Eran los tres que un cliente encuentra probando la aplicación.

**C-02 — editar producto.** Primero se alinearon las posiciones (el frontend enviaba 10
valores donde el procedimiento leía 11); después, el módulo de Lotes eliminó la clase
entera de error: la opción `07` se quedó con cinco parámetros y dos `UPDATE`, y las fechas
pasaron a editarse en `USP_MNT_Lotes`.

**C-03 — editar zona.** Exigió una operación de actualización que no existía en ninguna
capa: la opción `04` en `USP_MNT_Zonas`, `UPDATE_ZonaData`, un `PUT /api/zona` en el
controller, y que `zona-form.component.ts` distinga alta de edición en vez de ejecutar
`delete this.lZona.nIdZona`. De paso, la validación de imagen que nunca se ejecutaba:

```typescript
if (!(await this.fnValidarImagen())) { return; }   // faltaban los paréntesis
```

**C-08 — respuestas nulas.** El `return null` final de los seis controllers pasó a ser:

```csharp
return BadRequest(new { cod = "0", mensaje = $"Opcion no soportada: {genEnt.sOpcion}" });
```

**Y transacciones** (C-07) en `USP_MNT_Productos` opciones `06` y `07` y
`USP_MNT_Usuarios` opción `04`, los sitios donde un fallo a medias dejaba datos
inconsistentes.

## ✅ M-05 · Limpiar código muerto

**Resuelve:** `hallazgos-2026.md`, C-11, D-09 · **Esfuerzo:** 30 min

Media hora que cambió la primera impresión al abrir el repositorio. Se eliminó:

- `SISGAPO_API/WeatherForecast.cs` — plantilla por defecto
- `Data/Correo.cs` — clase vacía
- `Test/Entities.cs` — clase vacía
- `ClienteController.cs`, `ClienteBusiness.cs`, `ClienteData.cs`, `ClienteEntity.cs` — módulo
  histórico retirado del árbol actual; se conserva recuperable en Git (`../09-decisiones.md`, D-19)
- Las cinco clases de entidad vacías (`AlmacenEntity`, `CategoriaEntity`, `ProductoEntity`…)
- El bloque de correo comentado en `ProductoData.cs` (que además contenía una contraseña)
- Paquetes de EF Core y `.config/dotnet-tools.json`
- `Microsoft.AspNet.WebApi.Cors`
- El workflow duplicado `azure-static-web-apps-blue-sea-*.yml`
- `e2e/`
- `.sonarqube/` y `.vs/` del repositorio, añadidos al `.gitignore`

Y se unificaron los tres DTO equivalentes (`GeneralEntity`, `UsuarioEntity`,
`EntRequestUsuario`) en uno solo.

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
  que volverían inválida la existencia agregada del listado (D-31).
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

## ✅ M-11 · Reportes y panel de inicio

**Esfuerzo:** 3 días

`inicio.component.html` pesaba 0 bytes: la primera pantalla después de entrar estaba en
blanco (`../09-decisiones.md`, D-17). El panel muestra ahora almacenes y productos activos,
valor del inventario, distribución por categoría y almacén, y próximos vencimientos. Las
consultas viven en `USP_MNT_Panel`, cuatro agregaciones de solo lectura que no cambian
ninguna tabla, y el frontend usa la misma URL configurada que el resto de la aplicación.

**Resultado:** es la entrada visual de la demo y resume el estado actual. Lo que le falta
—actividad reciente y entradas y salidas del período— está anotado como ampliación en
`../08-mejoras-propuestas.md`: `USP_MNT_Movimientos` opción `04` ya devuelve esos totales.

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
- La existencia solo cambia aquí. Editar un producto o un lote ya no la toca (D-26).
- Un ajuste recibe la **cantidad contada** en el inventario físico, no la diferencia: el
  procedimiento calcula el delta para que quede en el kardex como entrada o salida (D-27).
- **El Asistente registra entradas y salidas; el ajuste queda para Supervisor y
  Administrador** (D-28). Es el primer caso de uso propio del rol Asistente, que hasta
  entonces solo consultaba.
- El usuario que firma el movimiento sale del token, nunca del formulario (D-29).

**Resultado:** el recorrido de la demo deja de ser un catálogo y pasa a explicar cómo cambia
el inventario: `login → panel → almacén → producto → lote → kardex`. Y el invariante
—existencia = suma del kardex— está cubierto por doce pruebas de integración contra SQL
Server que CI ejecuta en cada push.
