# 02 — Arquitectura

## 1. Vista general

```
┌────────────────────────────────────────────┐
│  Angular 9 SPA        (sisgapo-web)        │
│  Componentes → Servicios (HttpClient)      │
└──────────────────┬─────────────────────────┘
                   │  HTTP POST, JSON
                   │  { sOpcion, pParametro }
                   ▼
┌────────────────────────────────────────────┐
│  ASP.NET Core 5 Web API   (SISGAPO_API)    │
│  Controllers — enrutan por sOpcion         │
└──────────────────┬─────────────────────────┘
                   │  llamada directa (new)
                   ▼
┌────────────────────────────────────────────┐
│  Business — pass-through + try/catch       │
└──────────────────┬─────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────┐
│  Data — ADO.NET / SqlHelper                │
│  mapea IDataReader → DTOs de Entity        │
└──────────────────┬─────────────────────────┘
                   │  EXEC USP_MNT_xxx @sOpcion, @pParametro
                   ▼
┌────────────────────────────────────────────┐
│  SQL Server — 6 stored procedures          │
│  AQUÍ VIVE TODA LA LÓGICA DE NEGOCIO       │
└────────────────────────────────────────────┘
```

**La observación arquitectónica más importante:** las capas `Business` y `Data` del C# no
contienen lógica de negocio. `Business` solo reenvía la llamada. `Data` solo mapea filas a
objetos. Las reglas reales —validaciones de duplicados, generación de nombres de usuario,
generación de códigos de lote, baja lógica, filtros condicionales— están **dentro de los
stored procedures de T-SQL**.

Esto tiene una consecuencia directa para la migración: **cambiar de motor de base de datos no
es cambiar una cadena de conexión, es portar la aplicación entera.** Ver `07-migracion-tier-free.md`.

## 2. Proyectos de la solución

`sisgapo-api/SISGAPO_Back.sln` contiene cinco proyectos:

| Proyecto | Tipo | Referencias | Responsabilidad real |
|---|---|---|---|
| `SISGAPO_API` | `Microsoft.NET.Sdk.Web` | `Business`, `Entity` | Controllers, CORS, Swagger, pipeline HTTP |
| `Business` | Librería | `Data`, `Entity` | Pass-through con try/catch/log |
| `Data` | Librería | `Entity` | Conexión, ejecución de SPs, mapeo a DTOs |
| `Entity` | Librería | — | DTOs planos, sin comportamiento |
| `Test` | xUnit | `Business`, `Data` | 1 test (roto) |

El grafo de dependencias es limpio y unidireccional: no hay referencias circulares y `Entity`
no depende de nada. Eso está bien hecho.

## 3. El patrón `sOpcion` / `pParametro`

Es la decisión de diseño que define todo el sistema. Conviene entenderla bien antes de tocar
nada.

### Cómo funciona

Cada entidad expone **un solo endpoint** y **un solo stored procedure**. La operación concreta
se selecciona con un código de dos dígitos.

**1. El frontend arma el arreglo y lo aplana con `|`:**

```typescript
// sisgapo-web/src/app/modulos/usuarios/usuarios.service.ts
const params = {
  sOpcion: sOpcion,
  pParametro: pParametro.join('|')      // ["Juan","Pérez",1,...] → "Juan|Pérez|1|..."
};
return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
```

**2. El controller enruta por rango de códigos:**

```csharp
// sisgapo-api/SISGAPO_API/Controllers/AlmacenController.cs
if (genEnt.sOpcion == "01" || genEnt.sOpcion == "02" ||
    genEnt.sOpcion == "03" || genEnt.sOpcion == "04")
{
    // lecturas: devuelve la lista tal cual
    return Ok(objInventario.BusinessAlmacen(genEnt));
}
else if (genEnt.sOpcion == "05" || genEnt.sOpcion == "06" || genEnt.sOpcion == "07")
{
    // escrituras: el SP devuelve "1|mensaje", se parte y se reempaqueta
    string sResultado = Convert.ToString(objInventario.BusinessAlmacen(genEnt));
    string[] listaRes = sResultado.Split('|');
    return Ok(new { cod = listaRes[0], mensaje = listaRes[1] });
}
else
{
    return null;    // ← ver 06-hallazgos.md, C-08
}
```

**3. La capa `Data` hace un `switch` sobre el mismo código y mapea columnas distintas por rama:**

```csharp
// sisgapo-api/Data/ProductoData.cs
switch (genEnt.sOpcion)
{
    case "01":  // lista de almacenes  → EListaAlmacenProd
    case "02":  // lista de categorías → EListaCategoriaProd
    case "03":  // lista de productos  → EListaProductos
    ...
    case "06":
    case "07":
    case "08":  // escrituras → string "1|mensaje"
        return Convert.ToString(oCon.EjecutarEscalar("USP_MNT_Productos", genEnt.sOpcion, genEnt.pParametro));
}
```

**4. El stored procedure descompone `@pParametro` y hace un `IF/ELSE IF` gigante:**

```sql
-- Todos los USP_MNT_* empiezan igual
DECLARE @tParametro TABLE (id int, valor varchar(max));

IF (LEN(LTRIM(RTRIM(@pParametro))) > 0)
BEGIN
    INSERT INTO @tParametro (id, valor)
    SELECT id, valor FROM dbo.Split(@pParametro, '|');
END;

IF @sOpcion = '01'         -- CONSULTAR TODO
BEGIN ... END;
ELSE IF @sOpcion = '02'    -- CONSULTAR POR FILTROS
BEGIN
    SET @sNombres = (SELECT valor FROM @tParametro WHERE id = 1);
    SET @nIdRol   = CAST((SELECT valor FROM @tParametro WHERE id = 2) AS INT);
    ...
END;
```

La función `dbo.Split` (en `FuncionSplit.sql`) es una función con valores de tabla que itera
con `WHILE` y `CHARINDEX`, devolviendo `(id, valor)` con `id` empezando en 1.

### Contrato de respuesta de las escrituras

Los SPs terminan las escrituras con un `SELECT` de un string con formato `código|mensaje`:

```sql
SELECT '1|Se registró con éxito'
SELECT '1|Se actualizó con éxito'
SELECT CONCAT('1|', IIF(@bEstado=1, 'Se activó con éxito', 'Se eliminó con éxito'))
```

El controller lo parte y responde `{ "cod": "1", "mensaje": "Se registró con éxito" }`.

### Por qué es un antipatrón

1. **Sin tipado.** Todo viaja como string. Los `CAST(... AS INT)` fallan en tiempo de ejecución si el orden cambia.
2. **Acoplamiento posicional.** El significado de un valor depende de su índice. Insertar un campo en medio rompe silenciosamente las tres capas.
3. **El delimitador no se escapa.** Un almacén llamado `Norte|Sur` desplaza todos los parámetros siguientes. No es inyección SQL —los parámetros sí van parametrizados— pero sí corrupción de datos. Ver `06-hallazgos.md`, S-07.
4. **Swagger queda inútil.** El contrato documentado es siempre `{ sOpcion, pParametro }`, sin decir qué significa cada uno.
5. **No hay verbos HTTP.** Todo es `POST`, incluidas las lecturas. Sin caché, sin semántica REST.

### Por qué está bien mantenerlo (por ahora)

Es **consistente en las cuatro entidades principales**. Un patrón malo aplicado con
disciplina es más mantenible que cuatro patrones distintos aplicados a medias. Cambiarlo
implica tocar simultáneamente el SP, el `*Data.cs` y el `*.service.ts` de cada entidad.

Si lo cambias, ve entidad por entidad y termina cada una antes de empezar la siguiente.
Ver `09-mejoras-propuestas.md`, M-06.

### La excepción: `ZonaController`

`ZonaController` es el único que usa REST convencional:

```
GET  /api/zona              → lista de zonas
GET  /api/zona/editar/{id}  → una zona
POST /api/zona              → crear zona (body: ZonaEntity tipada)
```

Recibe un `ZonaEntity` tipado en lugar de un string delimitado, y devuelve
`List<ZonaEntity>` en vez de `IActionResult`. Es el módulo más limpio del backend, y es
probablemente el que se escribió primero o último con otro criterio.

**Es útil como prueba de que sabes hacerlo bien.** Si tuvieras que enseñar un solo controller
en una entrevista, enseña este — y explica por qué los otros cinco no son así.

## 4. Flujo completo de un request

Trazando **"el administrador crea un almacén"** de punta a punta:

**1. Componente Angular** (`almacenes-modal.component.ts`)
Arma el arreglo en el orden que espera el SP:
```typescript
pParametro = [nombre, direccion, idSupervisor, idZona];
```

**2. Servicio Angular** (`almacenes.service.ts`)
```typescript
POST https://localhost:44360/AlmacenesService
Content-Type: application/json
{ "sOpcion": "05", "pParametro": "Almacén Norte|Av. Perú 123|2|1" }
```

**3. `AlmacenController.CrudAlmacen`**
`"05"` cae en la rama de escrituras → llama a `AlmacenBusiness.BusinessAlmacen(genEnt)`.

**4. `AlmacenBusiness`**
```csharp
private readonly AlmacenData almacenData = new AlmacenData();   // ← instanciado como campo
return almacenData.DataAlmacen(genEnt);
```

**5. `AlmacenData`**
`switch` → caso `"05"` → `oCon.EjecutarEscalar("USP_MNT_Almacenes", "05", "Almacén Norte|...")`.

**6. `Conexion.EjecutarEscalar`** — aquí pasa algo que conviene conocer:

```csharp
DataSet ds = ObtenerParametros(sProcedure);   // ← EXEC sp_procedure_params_rowset
// recorre las filas para descubrir nombre y tipo de cada parámetro,
// construye SqlParameter[] y solo entonces:
SqlHelper.ExecuteScalar(oSqlConnIN, CommandType.StoredProcedure, sProcedure, arParms);
```

**Cada escritura hace dos viajes a la base de datos.** El primero consulta
`sp_procedure_params_rowset` —un stored procedure de sistema **no documentado** de SQL
Server— para descubrir la firma del SP en tiempo de ejecución. Como los seis SPs tienen
exactamente la misma firma (`@sOpcion VARCHAR(2)`, `@pParametro VARCHAR(MAX)`), esta
introspección no aporta nada: se puede reemplazar por dos `SqlParameter` explícitos y
eliminar ~120 de las 253 líneas de `Conexion.cs`. Ver `09-mejoras-propuestas.md`, M-02.

**7. `USP_MNT_Almacenes`, opción `05`**
```sql
SET @sNombre     = (SELECT valor FROM @tParametro WHERE id = 1);
SET @sDireccion  = (SELECT valor FROM @tParametro WHERE id = 2);
SET @nIdUsuario  = CAST((SELECT valor FROM @tParametro WHERE id = 3) AS INT);
SET @nIdZona     = CAST((SELECT valor FROM @tParametro WHERE id = 4) AS INT);

INSERT INTO [TBL_ALMACEN] (sNombre, sDireccion, nIdSupervisor, nIdZona, bEstado)
VALUES (@sNombre, @sDireccion, @nIdUsuario, @nIdZona, 1)

SELECT '1|Se registró con éxito'
```

**8. Vuelta**
`Conexion` devuelve `"1|Se registró con éxito"` → el controller lo parte →
`{ "cod": "1", "mensaje": "Se registró con éxito" }` → SweetAlert2 lo muestra.

## 5. Gestión de conexiones

Hay **dos mecanismos distintos** conviviendo, lo cual es una inconsistencia real:

**A. Vía `Conexion.cs` + `SqlHelper`** — lo usan `AlmacenData`, `CategoriaData`,
`ClienteData`, `LoginData`, `ProductoData`, `ZonaData`.

```csharp
public Conexion(Int32 idDatabase)
{
    if (idDatabase == 1)
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
        oSqlConnIN = builder.Build()["ConnectionStrings:connectionString"];
    }
}
```

Detalles a notar:
- El parámetro `idDatabase` sugiere soporte multi-base, pero solo existe el valor `1`. Si se pasa otro, `oSqlConnIN` queda `null` y falla más adelante.
- **Se lee y parsea `appsettings.json` desde disco en cada instanciación.** Y como cada clase `*Data` hace `new Conexion(1)` en su constructor, y cada `*Business` hace `new *Data()`, esto ocurre en cada request. Debería inyectarse `IConfiguration`.
- El campo `sqlTransaction` está declarado y se comprueba (`if (sqlTransaction != null)`), pero **nunca se asigna**: siempre es `null`. Es soporte transaccional a medio escribir. No hay transacciones en el sistema.

**B. `SqlConnection` a mano** — solo `UsuarioData`:

```csharp
var conn = new SqlConnection(conf);
conn.Open();
SqlCommand _Command = new SqlCommand("USP_MNT_Usuarios", conn);
_Command.CommandType = CommandType.StoredProcedure;
_Command.Parameters.Add(new SqlParameter("@sOpcion", erp.sOpcion));
_Command.Parameters.Add(new SqlParameter("@pParametro", erp.pParametro));
...
conn.Close();
```

`UsuarioData` **no usa `Conexion`**: duplica la lectura de configuración en su propio método
`ConfConexion()`. Y no usa `using`: si `ExecuteReader` lanza una excepción, `conn.Close()`
nunca se ejecuta y la conexión se filtra hasta que el GC la recoja.

Curiosamente, este código es el que **mejor** demuestra que el `sp_procedure_params_rowset`
de `Conexion` es innecesario: aquí los parámetros se pasan explícitos y funciona igual.

## 6. Inyección de dependencias: no la hay

`Startup.ConfigureServices` registra únicamente CORS, controllers y Swagger. Ningún servicio
propio está en el contenedor.

Todas las dependencias se instancian con `new` en campos de instancia:

```csharp
// Controller
private readonly AlmacenBusiness objInventario = new AlmacenBusiness();
// Business
private readonly AlmacenData almacenData = new AlmacenData();
// Data
public AlmacenData() { oCon = new Conexion(1); }
```

Consecuencias:
- **No se puede testear con dobles.** Es la razón de fondo por la que el único test unitario ataca la base de datos real.
- No se puede cambiar la implementación sin recompilar.
- La configuración se relee del disco en cada request.

Introducir DI es de las mejoras con mejor relación esfuerzo/beneficio: son ~15 líneas en
`Startup` y cambiar constructores. Ver `09-mejoras-propuestas.md`, M-03.

## 7. Pipeline HTTP y CORS

```csharp
// Startup.Configure
if (env.IsDevelopment())
{
    app.UseCors(o => o.WithOrigins("http://localhost:4200").AllowAnyMethod().AllowAnyHeader());
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(...);
}
else
{
    app.UseCors(o => o.WithOrigins("https://sisgapo.azurewebsites.net").AllowAnyMethod().AllowAnyHeader());
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthorization();          // ← sin UseAuthentication() delante
app.UseEndpoints(e => e.MapControllers());
```

Tres problemas concretos:

1. **`UseAuthorization()` sin `UseAuthentication()`.** Como no hay ningún `[Authorize]`, no hace nada. Es decorativo.
2. **El origen CORS de producción probablemente estaba mal.** Permite `https://sisgapo.azurewebsites.net`, pero el frontend se desplegaba en Azure Static Web Apps (`*.azurestaticapps.net` — hay dos workflows). Los dominios no coinciden.
3. **El frontend llamaba por HTTP y la API redirige a HTTPS.** `environment.prod.ts` apunta a `http://sisgapoback.azurewebsites.net/`, y `UseHttpsRedirection()` devuelve un 307. En un `POST` con preflight CORS eso suele romperse. Ver `06-hallazgos.md`, S-08.

**Swagger solo existe en Development.** Para una demo esto conviene invertirlo: exponer
Swagger en producción es una de las cosas que mejor se ven al enseñar una API.

## 8. Manejo de errores

El patrón se repite en las tres capas:

```csharp
catch (Exception e)
{
    logger.Error(e);
    throw;
}
```

Con dos agravantes:

- **No hay `nlog.config`.** NLog sin configuración no tiene targets, así que `logger.Error(e)` **no escribe en ningún lado**. Todos los logs del sistema se pierden.
- **No hay middleware de excepciones.** En producción (sin `UseDeveloperExceptionPage`) la excepción sale como un 500 sin cuerpo. El frontend hace `console.log(error)` y el usuario no ve nada.

Resultado: cuando algo falla en producción, no hay traza en el servidor ni mensaje en el
cliente. Ver `06-hallazgos.md`, C-09 y D-04.

## 9. Resumen para quien vaya a modificar el sistema

| Si vas a tocar... | Acuérdate de que... |
|---|---|
| Un campo de un formulario | El orden posicional en `pParametro` debe cambiar en el componente, en el `*Data.cs` y en el SP, a la vez |
| Una consulta | La lógica está en el SP, no en C#. El C# solo mapea columnas por nombre |
| El mapeo de una respuesta | `*Data.cs` accede por nombre de columna (`dr["nIdAlmacen"]`); renombrar un alias en el SP rompe el mapeo en tiempo de ejecución, sin error de compilación |
| La conexión | Hay dos rutas: `Conexion.cs` y el `SqlConnection` a mano de `UsuarioData` |
| Los códigos de operación | No son universales entre entidades. `"05"` es *insertar* en Almacenes y *listar por id* en Productos. Ver `04-api-referencia.md` |
