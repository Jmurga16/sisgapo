# 03 — Modelo de datos

> **Antes de nada:** los scripts en `sisgapo-web/src/scripts/` **no se pueden ejecutar tal
> cual**. Falta una columna, un procedimiento usa `ALTER` en vez de `CREATE`, dos archivos
> duplican objetos y las codificaciones están mezcladas. El detalle está en la sección 4.
> La versión corregida y lista para ejecutar está en `sql/`.

## 1. Diagrama entidad-relación

```
TBL_DOCUMENTO          TBL_ROL
     │                    │
     │ nTipoDoc           │ nRol
     ▼                    ▼
 ┌──────────────────────────────┐        ┌──────────────┐
 │        TBL_USUARIO           │        │   TBL_ZONA   │
 │ nIdUsuario (PK)              │        │ nIdZona (PK) │
 │ sNombres, sApellidos, sSexo  │        │ sNombre      │
 │ nTipoDoc → DOCUMENTO         │        │ sRutaImagen  │
 │ nRol     → ROL               │        └──────┬───────┘
 │ bEstado (baja lógica)        │               │
 └───────┬──────────────┬───────┘               │
         │ 1:1          │ nIdSupervisor         │ nIdZona
         ▼              ▼                       ▼
 ┌───────────────┐   ┌──────────────────────────────────┐
 │  TBL_LOGIN    │   │          TBL_ALMACEN             │
 │ nIdUsuario    │   │ nIdAlmacen (PK)                  │
 │ sNombreUsuario│   │ sNombre, sDireccion              │
 │ sContrasenia  │   │ nIdSupervisor → USUARIO (rol 2)  │
 │ (texto plano) │   │ nIdZona       → ZONA             │
 └───────────────┘   │ bEstado (baja lógica)            │
                     └───────────────┬──────────────────┘
                                     │ nIdAlmacen
                                     ▼
 ┌──────────────┐         ┌─────────────────────┐         ┌───────────────┐
 │TBL_CATEGORIA │────────▶│    TBL_CAT_PROD     │◀────────│ TBL_PRODUCTO  │
 │nIdCategoria  │         │ nIdCatProd (PK)     │         │ nIdProducto   │
 │sNombre       │         │ nIdAlmacen          │         │ sNombre       │
 │bEstado       │         │ nIdCategoria        │         │ bEstado       │
 └──────────────┘         │ nIdProducto         │         └───────┬───────┘
                          └─────────────────────┘                 │ nIdProducto
                                                                  ▼
 ┌──────────────────┐                          ┌───────────────────────────┐
 │ TBL_UNIDADMEDIDA │─────nIdUnidadMedida─────▶│    TBL_DET_PRODUCTO       │
 │ nIdUnidadMedida  │                          │ nIdDetProd (PK)           │
 │ sNombre          │                          │ nIdProducto  → PRODUCTO   │
 └──────────────────┘                          │ nIdUnidadMedida → UM      │
                                               │ nCantidad, nPrecio        │
 ┌──────────────┐                              │ sDescripcion, bEstado     │
 │  TBL_LOTE    │──────────nIdLote────────────▶│ nIdLote → LOTE            │
 │ nIdLote (PK) │                              └─────────────┬─────────────┘
 │ sNombreLote  │                                            │ nIdDetProd
 │ dFechaFab    │                                            ▼
 │ dFechaVenc   │                              ┌───────────────────────────┐
 └──────────────┘                              │      TBL_MOVIMIENTO       │
                                               │ nIdMovimiento (PK)        │
                                               │ nIdDetProd → DET_PRODUCTO │
                                               │ sTipo   E | S | A         │
                                               │ nCantidad (con signo)     │
                                               │ nSaldo, sMotivo, dFechaMov│
                                               │ nIdUsuario → USUARIO      │
                                               └───────────────────────────┘
```

**Doce tablas.** El modelo es correcto en lo esencial: normalizado, con catálogos separados,
baja lógica donde corresponde y una tabla puente (`TBL_CAT_PROD`) que ubica un producto de
una categoría en un almacén. `TBL_DET_PRODUCTO` tiene una fila por producto **y lote**, y
`TBL_MOVIMIENTO` explica cómo llegó cada lote a su existencia actual.

## 2. Detalle de las tablas

### Catálogos

| Tabla | Filas típicas | Contenido |
|---|---|---|
| `TBL_DOCUMENTO` | 2–3 | DNI, Carnet de Extranjería |
| `TBL_ROL` | 3 | 1 Administrador, 2 Supervisor, 3 Asistente |
| `TBL_UNIDADMEDIDA` | 4–5 | Kilogramos, Gramos, Unidad, Paquete |
| `TBL_ZONA` | 3–5 | Zona geográfica + URL de imagen representativa |

Los identificadores de `TBL_ROL` **están cableados en el código**, no leídos de la base:

- `USP_MNT_Almacenes` opción `04` filtra `WHERE nRol = 2` para listar supervisores elegibles.
- `usuarios-list.component.ts` tiene el arreglo `lRoles` con los tres roles escritos a mano.

Si cambias los ids de `TBL_ROL`, rompes las dos cosas.

### Usuarios y credenciales

`TBL_USUARIO` y `TBL_LOGIN` tienen relación 1:1, separadas para aislar las credenciales de
los datos personales. El esquema reparado aplica estas garantías:

- **`sContrasenia` guarda hashes bcrypt**, generados antes de llamar al procedimiento.
- **`TBL_LOGIN` tiene clave primaria y `UNIQUE(sNombreUsuario)`**. El original no tenía
  ninguna de las dos restricciones.

`USP_MNT_Usuarios` opción `04` genera el nombre de usuario automáticamente:

```sql
SET @sNombreUsuario = CONCAT(
    SUBSTRING(@sNombres,   1, CHARINDEX(' ', @sNombres+' ',   1) - 1), '.',
    SUBSTRING(@sApellidos, 1, CHARINDEX(' ', @sApellidos+' ', 1) - 1))
```

Es decir: primer nombre + `.` + primer apellido. Si ese nombre ya existe en `TBL_LOGIN`, el
procedimiento prueba los sufijos `2`, `3`, etc. hasta encontrar uno libre. Usuario y Login se
insertan en la misma transacción.

### Almacenes

Un almacén pertenece a una zona y tiene un supervisor, que debe ser un usuario con `nRol = 2`.
Esa regla **no está en el esquema** —no hay `CHECK` ni tabla aparte—, solo en el `WHERE` de
la opción `04` del procedimiento. Nada impide asignar un administrador como supervisor
mediante una llamada directa a la API.

### Inventario

Es la parte más elaborada del modelo. Un producto se registra en `TBL_PRODUCTO`, se ubica vía
`TBL_CAT_PROD` (almacén + categoría) y su detalle físico —cantidad, precio, unidad y lote—
vive en `TBL_DET_PRODUCTO`.

El código de lote lo genera `USP_MNT_Productos` opción `06` (y `USP_MNT_Lotes` opción `03`,
con el mismo criterio) cuando no llega uno escrito a mano:

```sql
SET @nContador   = 1
SET @sNombreLote = CONCAT(UPPER(LEFT(@sNombreProducto, 3)), RIGHT(CONCAT('0000', @nContador), 4))

WHILE EXISTS (SELECT 1 FROM TBL_LOTE WHERE sNombreLote = @sNombreLote)
BEGIN
    SET @nContador = @nContador + 1
    SET @sNombreLote = CONCAT(UPPER(LEFT(@sNombreProducto, 3)), RIGHT(CONCAT('0000', @nContador), 4))
END
```

Las tres primeras letras del nombre del producto más el primer correlativo libre:
`Café Orgánico...` → `CAF0001`. El original contaba productos con el **mismo nombre**, no
lotes, así que dos productos distintos que empezaran igual generaban códigos idénticos.
Ahora `TBL_LOTE.sNombreLote` es `UNIQUE` y el correlativo se busca como hace
`USP_MNT_Usuarios` con el nombre de usuario.

### Lotes y movimientos

`TBL_DET_PRODUCTO` tiene **una fila por producto y lote**, con restricción
`UNIQUE(nIdProducto, nIdLote)` y baja lógica propia. Un producto puede tener a la vez el lote
que vence en marzo y el que vence en junio, cada uno con su existencia, su precio y su fecha:
era el caso de uso central de un almacén con control de caducidad y el modelo de 2021 no lo
soportaba (`09-mejoras-propuestas.md`, M-09).

`TBL_MOVIMIENTO` es el libro del almacén. Una fila por entrada, salida o ajuste sobre un lote:

| Columna | Para qué |
|---|---|
| `sTipo` | `E` entrada, `S` salida, `A` ajuste. Con `CHECK` |
| `nCantidad` | La cantidad movida **con signo**: positiva suma, negativa resta. Un `CHECK` impide que una entrada reste o que una salida sume |
| `nSaldo` | La existencia del lote justo después del movimiento. Es lo que convierte la tabla en un kardex y no en una bitácora |
| `sMotivo` | Obligatorio. Es la mitad de la respuesta a «¿por qué cambió el stock?» |
| `nIdUsuario` | La otra mitad. Lo pone el controlador desde el token, nunca el formulario |
| `dFechaMov` | `GETDATE()` por defecto |

**El invariante del módulo:** `TBL_DET_PRODUCTO.nCantidad` es siempre la suma de
`TBL_MOVIMIENTO.nCantidad` del lote. `USP_MNT_Movimientos` lo mantiene en una transacción con
`UPDLOCK`, el seed lo cumple y las pruebas de integración lo comprueban
(`sisgapo-api/Test/InventarioIntegracionTests.cs`).

Todos los lotes de un producto comparten `nIdUnidadMedida`. Aunque el legado guarda la U.M.
en `TBL_DET_PRODUCTO`, el listado de productos suma sus cantidades y muestra una sola unidad;
`USP_MNT_Lotes` rechaza un alta o edición que mezcle unidades incompatibles (D-31).

Un ajuste recibe la **cantidad contada** en el inventario físico, no la diferencia: el
procedimiento calcula el delta y lo guarda con signo, para que el kardex lo muestre en la
columna de entrada o en la de salida según corresponda.

Dar de baja un lote con existencia se rechaza: dejaría stock fuera del inventario sin ningún
movimiento que lo explique.

## 3. Los stored procedures

Nueve procedimientos más una función. Toda la lógica de negocio del sistema está aquí.

| Procedimiento | Opciones | Firma |
|---|---|---|
| `USP_MNT_Login` | — | `@sNombreUsuario` |
| `USP_MNT_Zonas` | 01–03 | `@sOpcion`, `@nIdZona`, `@sNombre`, `@sRutaImagen` |
| `USP_MNT_Categorias` | 01–05 | `@sOpcion`, `@pParametro` |
| `USP_MNT_Almacenes` | 01–07 | `@sOpcion`, `@pParametro` |
| `USP_MNT_Usuarios` | 01–06 | `@sOpcion`, `@pParametro` |
| `USP_MNT_Productos` | 01–08 | `@sOpcion`, `@pParametro` |
| `USP_MNT_Panel` | 01–04 | `@sOpcion`, `@pParametro` |
| `USP_MNT_Lotes` | 01–06 | `@sOpcion`, `@pParametro` |
| `USP_MNT_Movimientos` | 01–04 | `@sOpcion`, `@pParametro` |
| `dbo.Split` (función) | — | `@String`, `@Delimitador` |

Los tres últimos son módulos nuevos: no existían en 2021 y no arrastran su estilo de errores.
`USP_MNT_Lotes` y `USP_MNT_Movimientos` validan antes de escribir y devuelven `0|motivo`
cuando la operación no procede, en vez de responder «éxito» sobre cero filas afectadas.

**`USP_MNT_Zonas` es la excepción**: recibe parámetros tipados en vez de un string
delimitado, y no tiene valor por defecto para `@sRutaImagen` (hay que pasarlo siempre).
Es coherente con que `ZonaController` sea el único controller REST.

**Clientes no forma parte del esquema publicado.** La tabla, el procedimiento y el módulo
se recuperaron del historial, pero se dejaron fuera de la demo hasta integrarlos y probarlos.
La decisión y los comandos de recuperación están en `10-decisiones.md`, D-19.

### La función `dbo.Split`

```sql
CREATE FUNCTION [dbo].[Split] (@String nvarchar(4000), @Delimitador nvarchar(10))
RETURNS @ValueTable TABLE ([id] int, [valor] nvarchar(4000))
```

Itera con `WHILE` y `CHARINDEX`, devolviendo `(id, valor)` con `id` empezando en 1.
Es una función multi-instrucción con valores de tabla: SQL Server no puede alinearla, así que
se ejecuta fila a fila. Con los volúmenes de esta aplicación da igual.

Notas:
- El parámetro es `nvarchar(4000)`, pero los procedimientos declaran `@pParametro VARCHAR(MAX)`. **Un parámetro de más de 4000 caracteres se trunca en silencio.**
- Existe la variable `@CommaCheck`, que se asigna y nunca se usa.
- SQL Server 2016+ trae `STRING_SPLIT` nativa, pero no devuelve el índice ordinal hasta la versión con `enable_ordinal` (compatibilidad 160+), y aquí el índice es imprescindible. Mantener `dbo.Split` es razonable.

## 4. Fallos en los scripts, uno por uno

Esta es la sección operativa: cada punto es una razón por la que la base de datos **no se
puede recrear** hoy desde `sisgapo-web/src/scripts/`.

### Bloqueantes

**1. Falta la columna `TBL_USUARIO.nRol`.**
`CreacionTablas.sql` no la crea. La usan `PoblacionDatos.sql` (en el `INSERT`),
`USP_MNT_Usuarios` (opciones 01, 02, 04, 05), `USP_MNT_Login` y `USP_MNT_Almacenes`
(opción 04). Sin esa columna nada funciona: ni el seed carga ni el login responde.
Es el fallo más grave del conjunto.

**2. `USP_MNT_Almacenes.sql` usa `ALTER PROCEDURE`.**
Se guardó desde SSMS con la opción de modificar, no de crear. En una base nueva
falla con `Cannot find the object "USP_MNT_Almacenes"`.

**3. `CreacionTablasParte2.sql` duplica seis tablas** que ya crea `CreacionTablas.sql`
(`TBL_CATEGORIA`, `TBL_PRODUCTO`, `TBL_CAT_PROD`, `TBL_LOTE`, `TBL_UNIDADMEDIDA`,
`TBL_DET_PRODUCTO`). Si se ejecuta después, falla con "There is already an object named…".
Parece un artefacto de haber trabajado por iteraciones.

**4. `PoblacionDatosParte2.sql` duplica datos** de `PoblacionDatos.sql` (categorías,
productos, unidades de medida, lotes). Ejecutarlo deja el catálogo duplicado.

**5. `USE DB_SISGAPO` en la cabecera.** Azure SQL Database **no permite `USE`** para cambiar
de base. Los scripts fallan al primer lote si se lanzan contra Azure SQL sin editarlos.

### Corrupción de datos

**6. Codificaciones mezcladas.** Comprobado archivo por archivo:

| Archivo | Codificación real |
|---|---|
| `CreacionBD.sql` | ASCII |
| `CreacionTablas.sql` | UTF-8 |
| `CreacionTablasParte2.sql` | ASCII |
| `FuncionSplit.sql` | **ISO-8859-1** |
| `PoblacionDatos.sql` | UTF-8 |
| `PoblacionDatosParte2.sql` | **ISO-8859-1** |
| `USP_MNT_Almacenes.sql` | **UTF-16LE con BOM** |
| `USP_MNT_Categorias.sql` | UTF-8 |
| `USP_MNT_Login.sql` | ASCII |
| `USP_MNT_Productos.sql` | UTF-8 |
| `USP_MNT_Usuarios.sql` | UTF-8 |
| `USP_MNT_Zonas.sql` | ASCII |

Por eso `PoblacionDatosParte2.sql` contiene literalmente `Caf� Org�nico` y
`Descontena el parametro` aparece con acentos rotos en varios comentarios.
Cualquier herramienta que asuma una sola codificación va a corromper texto.

### Integridad

**7. `TBL_LOGIN` sin clave primaria ni `UNIQUE`.** Permite usuarios duplicados.

**8. `TBL_DET_PRODUCTO.nIdLote` sin clave foránea.** Es la única relación del modelo sin
restricción declarada — todas las demás sí la tienen. Permite lotes huérfanos.

### Bugs de lógica dentro de los procedimientos

Estos no impiden crear la base, pero producen comportamiento incorrecto en ejecución.

**9. `USP_MNT_Usuarios` opción 04 — el contador de desambiguación siempre sumaba.**

```sql
SET @nContador = (SELECT COUNT(*) FROM [TBL_USUARIO]
                  WHERE sNombres = LOWER(@sNombres) AND sApellidos = LOWER(@sApellidos)) + 1
IF (@nContador > 0)
    SET @sNombreUsuario = CONCAT(@sNombreUsuario, @nContador)
```

Como al `COUNT(*)` se le suma 1, `@nContador` vale como mínimo 1, así que la condición
`> 0` **siempre se cumple**: todos los usuarios creados desde la aplicación reciben un sufijo
numérico. Y como el `COUNT(*)` se ejecuta **después** del `INSERT` del propio usuario, y la
intercalación por defecto de SQL Server no distingue mayúsculas (`'Pedro' = LOWER('Pedro')`
es verdadero), el conteo ya incluye al recién insertado.

Verificado contra SQL Server 2022:

```sql
EXEC USP_MNT_Usuarios @sOpcion='04',
     @pParametro='Pedro|Ramos|1|12345678|M|3|Calle X|999888777|1995-01-01|clave123';

SELECT sNombreUsuario FROM TBL_LOGIN WHERE nIdUsuario = 7;
-- → pedro.ramos2
```

Ese era el comportamiento original. El procedimiento reparado usa primero `pedro.ramos` y
solo añade `2`, `3`, etc. ante colisiones reales. También revierte el alta completa si no
puede crear las credenciales.

**10. `USP_MNT_Zonas` opción 03 — la comprobación de duplicados no funciona.**

```sql
IF ((SELECT COUNT(*) FROM [TBL_ZONA] WHERE sNombre = LOWER(@sNombre)) = 0)
BEGIN
    INSERT INTO TBL_Zona (sNombre, sRutaImagen) VALUES (@sNombre, @sRutaImagen);
END
```

Compara el valor almacenado contra la versión en minúsculas del parámetro. Insertar `Lima`
guarda `Lima`; el siguiente intento compara `sNombre = 'lima'`, que en una intercalación
sensible a mayúsculas no coincide. Y si por casualidad sí detectase el duplicado, **no hay
`ELSE`**: el procedimiento no devuelve nada y el cliente no se entera de que no se guardó.

**11. `USP_MNT_Productos` opción 07 — editar fechas de lote no hace nada.**

```sql
UPDATE [TBL_LOTE]
   SET dFechaFab = @dFechaFab, dFechaVenc = @dFechaVenc
 WHERE nIdLote = @nIdLote          -- @nIdLote nunca se asignó → NULL
```

La opción 07 lee once valores de `@pParametro` y ninguno es `@nIdLote`. La variable queda
`NULL`, `WHERE nIdLote = NULL` no coincide con ninguna fila y el `UPDATE` afecta a cero
registros. **Editar la fecha de fabricación o de vencimiento de un producto falla en
silencio**, sin error: el procedimiento sigue devolviendo `'1|Se actualizó con éxito'`.

Este es el bug funcional más serio del sistema, porque el control de vencimientos es el
motivo por el que el cliente ficticio pedía el software.

**12. `@@IDENTITY` en vez de `SCOPE_IDENTITY()`.**
`USP_MNT_Productos` opción 06 usa `@@IDENTITY` dos veces. `@@IDENTITY` devuelve el último
identity de la sesión, incluidos los generados por triggers en otras tablas. Hoy no hay
triggers, así que funciona; si alguien añade uno, este código empieza a insertar filas mal
relacionadas de forma silenciosa. `USP_MNT_Usuarios` usa correctamente `SCOPE_IDENTITY()`
para el mismo propósito — la inconsistencia está dentro del mismo repositorio.

**13. Las escrituras multi-tabla originalmente no usaban transacciones.**
`USP_MNT_Productos` 06/07 y `USP_MNT_Usuarios` 04 ya ejecutan sus cambios dentro de una
transacción y revierten el conjunto ante un error.

## 5. Cómo recrear la base de datos

Usa `sql/`, no los scripts originales. Ver `sql/README.md` para el procedimiento completo.

> **Verificado.** Los doce scripts de `sql/` se ejecutaron de principio a fin contra
> `mcr.microsoft.com/mssql/server:2022-latest` sin un solo error, con los conteos esperados y
> los acentos correctos. Los nueve procedimientos responden, el login y los movimientos se
> comprobaron por HTTP con `demo.supervisor` y `demo.asistente`, y las pruebas de integración
> pasan contra esa misma base.

Resumen:

```bash
cd sisgapo-docs/sql

# 1. Levantar SQL Server local
docker run -d --name sisgapo-db \
  -e ACCEPT_EULA=Y -e MSSQL_SA_PASSWORD='Sisgapo!Demo2026' -e MSSQL_PID=Express \
  -p 1433:1433 mcr.microsoft.com/mssql/server:2022-latest

# 2. Crear la base
docker exec sisgapo-db /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'Sisgapo!Demo2026' -C -Q "CREATE DATABASE DB_SISGAPO"

# 3. Ejecutar los scripts en orden
for f in [0-9][0-9]-*.sql; do
  docker exec -i sisgapo-db /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P 'Sisgapo!Demo2026' -C -d DB_SISGAPO -b < "$f" || break
done
```

Qué se corrigió en `sql/` respecto a los originales:

| Corrección | Archivo |
|---|---|
| Se añade `TBL_USUARIO.nRol` con clave foránea a `TBL_ROL` | `01-esquema.sql` |
| `TBL_LOGIN` recibe clave primaria y `UNIQUE` en `sNombreUsuario` | `01-esquema.sql` |
| `TBL_DET_PRODUCTO.nIdLote` recibe clave foránea | `01-esquema.sql` |
| `VARCHAR(MAX)` acotado en columnas de join e índice | `01-esquema.sql` |
| Índices sobre las claves foráneas | `01-esquema.sql` |
| Script reejecutable (`DROP TABLE IF ...` al inicio) | `01-esquema.sql` |
| Se elimina el duplicado de `CreacionTablasParte2.sql` | fusionado |
| Se elimina el duplicado de `PoblacionDatosParte2.sql` | fusionado |
| Todo pasa a UTF-8 | todos |
| `ALTER PROCEDURE` → `CREATE PROCEDURE` | `05-usp-almacenes.sql` |
| Se elimina `USE [DB_SISGAPO]` (Azure SQL no lo admite) | todos |
| Datos de demostración ampliados y con acentos correctos | `03-seed.sql` |
| `TBL_DET_PRODUCTO` pasa a una fila por producto y lote, con estado propio | `01-esquema.sql` |
| `TBL_LOTE.sNombreLote` pasa a ser `UNIQUE` y el correlativo busca el primer hueco libre | `01-esquema.sql`, `07-usp-productos.sql` |
| Tabla `TBL_MOVIMIENTO` y sus dos procedimientos | `01-esquema.sql`, `11`, `12` |

Las tres últimas filas no son correcciones de compatibilidad sino funcionalidad nueva: son
los módulos de Lotes y Movimientos. Ver la sección 2 y `09-mejoras-propuestas.md`, M-09 y M-12.

**Los bugs de lógica 9–13 NO se corrigieron en `sql/`.** Son cambios de comportamiento, no de
compatibilidad, y merecen decidirse a conciencia. Están priorizados en
`06-hallazgos.md` y `09-mejoras-propuestas.md`.

## 6. Si migras a otro motor

El coste real de cambiar de motor no son las tablas —el DDL es casi portable— sino los
**950 líneas de T-SQL** de los procedimientos. Inventario de lo que no es estándar:

| Construcción | Dónde | Equivalente en PostgreSQL |
|---|---|---|
| `IIF(cond, a, b)` | Todos los `USP_MNT_*` | `CASE WHEN cond THEN a ELSE b END` |
| `SCOPE_IDENTITY()` / `@@IDENTITY` | Usuarios, Productos | `RETURNING id` |
| `IDENTITY(1,1)` | Todas las tablas | `GENERATED ALWAYS AS IDENTITY` |
| `DECLARE @tabla TABLE (...)` | Todos | Tabla temporal o `unnest()` |
| `dbo.Split(...)` | Todos | `string_to_array()` / `unnest() WITH ORDINALITY` |
| `CONVERT(VARCHAR, fecha, 23)` | Usuarios op. 03 | `to_char(fecha, 'YYYY-MM-DD')` |
| `sp_procedure_params_rowset` | `Conexion.cs` | No existe; hay que eliminarlo |
| `VARCHAR(MAX)` | Todas | `TEXT` |
| `BIT` | Todas | `BOOLEAN` |
| `GO` (separador de lotes) | Todos | No existe; es de sqlcmd, no de T-SQL |
| Corchetes `[TBL_X]` | Todos | Comillas dobles o nada |

A eso se suma cambiar `System.Data.SqlClient` por `Npgsql` en la capa `Data`, y que
PostgreSQL **pliega los identificadores sin comillas a minúsculas** — lo que rompe el mapeo
del C#, que accede por nombre exacto (`dr["nIdAlmacen"]`). Habría que revisar cada `dr[...]`
del sistema.

Estimación honesta: **3 a 5 días** para portar los nueve procedimientos y la capa de datos, más
pruebas. No es imposible, pero para una demo hay caminos más baratos.
Ver `07-migracion-tier-free.md`, sección 4, donde se comparan las opciones.
