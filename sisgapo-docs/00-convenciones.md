# 00 — Convenciones del proyecto

Reglas que sigue el código de SISGAPO. Conviene leerlas antes de tocar nada: casi todas
son decisiones de 2021 que se mantienen a propósito, y romperlas a medias deja el
proyecto peor que respetarlas.

## 1. Estructura

```
sisgapo/
├── docker-compose.yml     Levanta SQL Server con el esquema y los datos de demo
├── docker/init-db.sh      Script de carga que usa el contenedor de inicialización
├── sisgapo-api/           Backend .NET 5 — solución SISGAPO_Back.sln
│   ├── SISGAPO_API/       Capa web: controllers, Startup, appsettings
│   ├── Business/          Capa de negocio
│   ├── Data/              Acceso a datos, vía stored procedures
│   ├── Entity/            DTOs
│   └── Test/              xUnit (sin pruebas reales por ahora)
├── sisgapo-web/           Frontend Angular 9
│   └── src/scripts/       Scripts SQL originales de 2021 — NO EJECUTAR
└── sisgapo-docs/          Documentación y análisis
    └── sql/               Esquema mantenido y verificado
```

Dos rarezas que conviene conocer de antemano:

**Los scripts SQL originales viven dentro del proyecto Angular**, en
`sisgapo-web/src/scripts/`. Es contraintuitivo, y es así desde 2021. Se conservan como
registro del estado original y **no se pueden ejecutar**: les falta una columna, un
procedimiento usa `ALTER` en vez de `CREATE` y dos archivos duplican objetos. La versión
que sí funciona está en `sisgapo-docs/sql/`. El detalle, en `03-modelo-de-datos.md`, sección 4.

**El repositorio es un monorepo con dos historiales importados.** En 2021 el proyecto
vivía en dos repositorios separados; sus 57 commits se conservan bajo `sisgapo-api/` y
`sisgapo-web/`, así que `git log` y `git blame` por archivo funcionan con normalidad.

## 2. Idioma

**Todo en español**: código, identificadores, comentarios, mensajes de la interfaz,
nombres de tablas y documentación. Los únicos términos en inglés son los que impone el
framework (`Controller`, `Business`, `Data`, `Entity`) y las palabras clave del lenguaje.

## 3. Notación húngara

Un prefijo de una letra indica el tipo. Se aplica igual en C#, TypeScript y T-SQL, y es
la convención más visible del proyecto:

| Prefijo | Tipo | Ejemplo |
|---|---|---|
| `n` | numérico entero | `nIdUsuario`, `nCantidad` |
| `s` | cadena | `sNombre`, `sDescripcion` |
| `b` | booleano | `bEstado` |
| `d` | fecha | `dFechaVencimiento` |
| `p` | parámetro de entrada | `pParametro` |
| `l` / `lista` | colección | `lZonas`, `listaProductos` |
| `o` | objeto | `oResumen`, `oCon` |
| `f` | control de formulario (Angular) | `fAlmacen`, `fNombre` |
| `ar` | arreglo | `arOrigenes`, `arPartes` |

En la base de datos:

| Prefijo | Objeto |
|---|---|
| `TBL_` | tabla — `TBL_PRODUCTO`, `TBL_CAT_PROD` |
| `USP_MNT_` | procedimiento de mantenimiento — `USP_MNT_Productos` |

Los métodos de TypeScript llevan `fn`: `fnListarProductos()`, `fnCambiarEstado()`.

## 4. El contrato `sOpcion` / `pParametro`

Los endpoints de panel, usuarios, almacenes e inventario comparten un contrato compatible
con los procedimientos almacenados históricos:

```jsonc
POST /AlmacenesService
{ "sOpcion": "05", "parametros": ["Almacén Norte", "Av. Perú 123", "2", "1"] }
```

- **`sOpcion`** es un código de dos dígitos que selecciona la operación. **No es
  universal:** `"05"` es *insertar* en Almacenes y *obtener por id* en Productos. Cada
  entidad tiene su propio catálogo, y está completo en `04-api-referencia.md`.
- **`parametros`** transporta los valores separados desde Angular. La capa Business
  comprueba que ningún valor contenga `|`, reconstruye internamente `pParametro` y el
  procedimiento lo separa con `dbo.Split`. El formato delimitado se conserva solo dentro
  del backend para no reescribir los procedimientos históricos.
- Las **lecturas** devuelven el arreglo tal cual lo produce el procedimiento.
- Las **escrituras** devuelven `'1|Se registró con éxito'`, que el controller parte en
  `{ cod, mensaje }`.

**Si cambias una operación, cámbiala en las tres capas a la vez**: procedimiento,
`*Data.cs` y `*.service.ts`. Los cuatro bugs más graves del proyecto —C-02, C-12, C-13 y
C-14 en `06-hallazgos.md`— son exactamente esto: una capa que dejó de estar de acuerdo con
otra sin que nada lo detectara.

Dos advertencias sobre el patrón:

- **No hay tipado.** Todo viaja como texto y el orden posicional es la única
  documentación. Un parámetro de más o de menos no da error de compilación.
- **El delimitador no se escapa.** Un almacén llamado `Norte|Sur` desplaza todos los
  parámetros siguientes. Está registrado como S-07 y sigue abierto: valida en el
  formulario que el texto no contenga `|`.

**Excepción:** `ZonaController` usa REST convencional —`GET /api/zona`,
`POST /api/zona`, `PUT /api/zona`— con cuerpos tipados. Es el único módulo así, y la
razón de que su procedimiento tenga parámetros con nombre en lugar de una cadena
delimitada.

## 5. Capas

```
Controller  →  Business  →  Data  →  Stored procedure
```

- **Controller** valida `sOpcion`, llama a negocio y da forma a la respuesta.
- **Business** es hoy un pasamanos con `try/catch`. No contiene reglas de negocio.
- **Data** abre la conexión y mapea `IDataReader` a DTOs.
- **El procedimiento tiene toda la lógica real.**

Es una decisión de 2021 que se mantiene (`10-decisiones.md`, D-04). Tiene una ventaja
—se puede parchear sin desplegar— y una desventaja grande: la lógica no se puede probar
con dobles ni revisar en un diff con comodidad.

**Al añadir una operación**, respeta el recorrido completo. Un método en `Data` que no
pase por `Business` funciona, pero rompe la simetría que hace el código predecible.

## 6. Reglas de datos

- **Baja lógica, nunca borrado físico.** Todas las tablas con ciclo de vida llevan
  `bEstado BIT`, y «eliminar» es `UPDATE ... SET bEstado = 0`. La especificación de 2021
  pedía borrado definitivo; se implementó baja lógica y es la decisión correcta, porque
  conserva la trazabilidad y no rompe claves foráneas.
- **Los listados devuelven activos e inactivos**, con una columna `sEstado` calculada con
  `IIF(bEstado = 1, 'Activo', 'Inactivo')`, y ordenan `bEstado DESC` para que lo activo
  salga primero. Los selectores de formulario, en cambio, ofrecen **solo activos**.
- **Las escrituras multi-tabla van en transacción**, con `BEGIN TRY` / `BEGIN
  TRANSACTION` / `COMMIT` y un `CATCH` que hace `ROLLBACK` y devuelve `'0|<motivo>'`.
- **Los identificadores de `TBL_ROL` están cableados** en el código (`nRol = 2` para
  supervisores). Cambiarlos rompe la asignación de supervisores y el filtro de usuarios.

## 7. Configuración y secretos

- **La cadena de conexión no se versiona.** Se resuelve en `Data/ConfiguracionBD.cs`
  desde la variable de entorno `SISGAPO_CONNECTION_STRING`, o desde
  `dotnet user-secrets`. En `appsettings.json` queda un marcador de posición vacío.
- **Ningún valor de entorno va escrito en el código.** Los orígenes CORS salen de
  `Cors:OrigenesPermitidos`; la URL de la API, de `src/environments/`.
- **Los datos de demostración son públicos a propósito** y están documentados en
  `sql/README.md`. Las contraseñas siguen en texto plano —S-02, pendiente—, así que
  **esta aplicación no se despliega en internet** hasta que eso se resuelva.

## 8. Estilo

**C#**

- Regiones `#region` por operación en las clases `*Data`, como en 2021.
- `try { ... } catch (Exception e) { logger.Error(e); throw; }` en las tres capas.
- Un `sOpcion` no contemplado responde `BadRequest(new { cod = "0", mensaje = ... })`,
  nunca `null`: un `IActionResult` nulo se convierte en un 204 sin cuerpo que el frontend
  no sabe interpretar.

**TypeScript**

- Un componente de lista más un componente modal por módulo. El modal recibe
  `{ accion, id }` por `MAT_DIALOG_DATA`, donde `accion === 0` es alta.
- Los servicios envuelven `HttpClient` y devuelven promesas con `.toPromise()`. Está
  deprecado en RxJS 7; se mantiene por coherencia hasta que se migre el conjunto.
- Confirmaciones y avisos con SweetAlert2. **Toda respuesta `cod === '0'` tiene que
  mostrar su mensaje**: el fallo más repetido del proyecto era rechazar una operación en
  silencio y navegar como si hubiera funcionado.
- Los adornos —fondos, ondas, ilustraciones— llevan `pointer-events: none` y
  `aria-hidden="true"`. Un elemento decorativo que captura un clic es un bug difícil de
  encontrar.

**T-SQL**

- `CREATE OR ALTER PROCEDURE`, para que los scripts se puedan reejecutar.
- Los parámetros se leen al principio del bloque de cada opción, con
  `SET @x = (SELECT valor FROM @tParametro WHERE id = n)`.
- Las correcciones posteriores a 2021 van marcadas con un comentario `--[FIX]` que
  explica **qué hacía antes**. Así el diff se entiende sin abrir el historial.

## 9. Antes de dar algo por terminado

1. `dotnet build SISGAPO_Back.sln` — sin errores.
2. `npm run build` en `sisgapo-web` — sin errores.
3. La operación probada **contra la base de datos**, no solo compilada. Los bugs de este
   proyecto no eran de compilación: eran capas que dejaron de entenderse entre sí.
4. Si el cambio afecta al comportamiento, actualiza `06-hallazgos.md`; si es una decisión
   discutible, anótala en `10-decisiones.md`.
