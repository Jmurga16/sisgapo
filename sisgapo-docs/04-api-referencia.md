# 04 — Referencia de la API

Base URL en desarrollo: `https://localhost:44360/`
Base URL en producción (histórica, ya no existe): `http://sisgapoback.azurewebsites.net/`

Swagger está disponible en `/swagger` **solo cuando el entorno es Development**.

> **Todos los controladores llevan `[Authorize]`.** Salvo `/LoginService` y
> `/ConfiguracionService`, cada endpoint exige `Authorization: Bearer <token>` y, en las
> escrituras, el rol correspondiente. Ver la sección 2 y `06-hallazgos.md`, S-03.

## 1. Convención general

Todos los endpoints menos `/api/Zona` comparten el mismo contrato:

```http
POST /{Servicio}
Content-Type: application/json

{
  "sOpcion": "05",
  "pParametro": "valor1|valor2|valor3"
}
```

- `sOpcion` — código de dos dígitos que selecciona la operación.
  **No es universal:** `"05"` es *insertar* en Almacenes y *listar por id* en Productos.
- `pParametro` — argumentos concatenados con `|`, en orden posicional.
  Para operaciones sin argumentos se envía `""`.

**Respuesta de lecturas:** el arreglo de objetos tal cual lo devuelve el procedimiento.

**Respuesta de escrituras:**
```json
{ "cod": "1", "mensaje": "Se registró con éxito" }
```

**Si `sOpcion` no está en el rango esperado**, el controller hace `return null`, que ASP.NET
Core traduce a `204 No Content` con cuerpo vacío. El frontend no lo maneja.

`ZonaController` es la excepción: usa REST convencional con cuerpos tipados (sección 7).

## 2. `POST /LoginService`

Único endpoint que no usa `sOpcion`.

**Request**
```json
{ "sNombreUsuario": "demo.supervisor", "sContrasenia": "SisgapoDemo2026!" }
```

**Response `200`**
```json
{
  "sToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "nIdUsuario": 8,
  "nIdRol": 2,
  "sNombreUsuario": "demo.supervisor",
  "sNombrePersona": "Usuario Demo Supervisor",
  "dExpira": "2026-09-02T14:27:58.3726689Z"
}
```

**Response `401`** — `{ "cod": "0", "mensaje": "Usuario o contraseña incorrectos." }`.
Mismo cuerpo si el usuario no existe, si la contraseña no coincide o si el usuario está
dado de baja: distinguirlos permitiría averiguar qué usuarios hay.

El resto de endpoints exige `Authorization: Bearer <sToken>`. Sin cabecera responden `401`;
con un rol insuficiente, `403`. `UsuariosService` exige administrador; las escrituras de
almacenes, zonas e inventario exigen administrador o supervisor. El token dura 8 horas por
defecto (`Jwt:MinutosVigencia`).

> Contrato anterior, por si te encuentras código viejo: devolvía `[ { "nIdRol": 1,
> "result": 1 } ]`, donde `result` era un `ROW_NUMBER()` y no un código de estado, y no
> emitía token alguno.

## 3. `POST /UsuariosService`

Procedimiento: `USP_MNT_Usuarios`.

| `sOpcion` | Operación | `pParametro` (posiciones) |
|---|---|---|
| `01` | Listar todos | *(vacío)* |
| `02` | Listar con filtros | `1` nombre · `2` idRol (`0` = todos) · `3` estado (`2` = todos) |
| `03` | Obtener por id | `1` nIdUsuario |
| `04` | Insertar | `1` nombres · `2` apellidos · `3` nTipoDoc · `4` numDoc · `5` sexo · `6` nIdRol · `7` dirección · `8` teléfono · `9` fechaNac · `10` contraseña |
| `05` | Editar | igual que `04`, más `11` nIdUsuario |
| `06` | Activar / dar de baja | `1` nIdUsuario · `2` bEstado (`1` activa, `0` da de baja) |

**Respuesta de `01` y `02`**
```json
[ { "nIdUsuario": 1, "sNombrePersona": "Administrador del Sistema",
    "sNombreUsuario": "admin", "sNombreRol": "Administrador", "sEstado": "Activo" } ]
```

**Respuesta de `03`** — join usuario + login, con `dFechaNac` como texto `YYYY-MM-DD`
además del `dFechaNacimiento` nativo. No devuelve el hash de contraseña.

**Respuesta de `04`, `05`, `06`** — este endpoint **no sigue** el contrato `cod`/`mensaje`:
```json
{ "mensaje": "OK" }
```

`UsuarioData` construye `"OK"` en C# a partir de `ExecuteNonQuery() != 0`, en vez de leer un
mensaje del procedimiento. Es el único módulo así.

**Detalle a tener en cuenta:** la opción `04` genera el nombre de usuario automáticamente
(primer nombre + `.` + primer apellido). Si ya existe, añade `2`, `3`, etc. Ver
`03-modelo-de-datos.md`, sección 4, hallazgo 9.

## 4. `POST /AlmacenesService`

Procedimiento: `USP_MNT_Almacenes`.

| `sOpcion` | Operación | `pParametro` (posiciones) |
|---|---|---|
| `01` | Listar almacenes | *(vacío)* |
| `02` | Obtener por id | `1` nIdAlmacen |
| `03` | Listar zonas (para el selector) | *(vacío)* |
| `04` | Listar supervisores (`nRol = 2`, activos) | *(vacío)* |
| `05` | Insertar | `1` nombre · `2` dirección · `3` nIdSupervisor · `4` nIdZona |
| `06` | Editar | igual que `05`, más `5` nIdAlmacen |
| `07` | Activar / dar de baja | `1` nIdAlmacen · `2` bEstado |

**Respuesta de `01`**
```json
[ { "nIdAlmacen": 1, "sNombreZona": "Junín",
    "sNombreAlmacen": "Almacén Central Satipo", "sEstado": "Activo" } ]
```

Ordena por `bEstado DESC, nIdZona`: los activos primero.

**Respuesta de `03`** — `[{ "nIdZona": 1, "sNombreZona": "Junín" }]`
**Respuesta de `04`** — `[{ "nIdSupervisor": 2, "sNombrePersona": "Jose M" }]`

**Respuesta de `05`, `06`, `07`** — `{ "cod": "1", "mensaje": "Se registró con éxito" }`

> El frontend envía 5 valores en la opción `05`, pero el procedimiento solo lee 4. El quinto
> (`nIdAlmacen`, que en alta viene vacío) se ignora sin efecto. Es inofensivo, pero explica
> por qué el mismo método sirve para alta y edición.

## 5. `POST /InventarioService/Categoria`

Procedimiento: `USP_MNT_Categorias`.

| `sOpcion` | Operación | `pParametro` (posiciones) |
|---|---|---|
| `01` | Listar categorías | *(vacío)* |
| `02` | Obtener por id | `1` nIdCategoria |
| `03` | Insertar | `1` nombre · `2` descripción |
| `04` | Editar | `1` nombre · `2` descripción · `3` nIdCategoria |
| `05` | Activar / dar de baja | `1` nIdCategoria · `2` bEstado |

**Respuesta de `01`**
```json
[ { "nIdCategoria": 1, "sNombre": "Café Orgánico",
    "sDescripcion": "Café producido sin...", "sEstado": "Activo", "bEstado": true } ]
```

Es el módulo más coherente del conjunto: los índices de `pParametro` coinciden exactamente
con lo que el procedimiento lee, en todas las opciones.

## 6. `POST /InventarioService/Producto`

Procedimiento: `USP_MNT_Productos`. Mantiene el catálogo: qué se almacena y dónde. El detalle
físico —partidas, existencias y sus movimientos— vive en los dos endpoints siguientes.

| `sOpcion` | Operación | `pParametro` (posiciones) |
|---|---|---|
| `01` | Listar almacenes activos | *(vacío)* |
| `02` | Listar categorías activas | *(vacío)* |
| `03` | Listar productos (tabla principal) | `1` nIdAlmacen · `2` nIdCategoria (`0` = todos) |
| `04` | Listar unidades de medida | *(vacío)* |
| `05` | Obtener producto por id | `1` nIdCatProd |
| `06` | Insertar producto + primer lote | `1` nombre · `2` nIdAlmacen · `3` nIdCategoria · `4` nIdUnidadMedida · `5` cantidad · `6` precio · `7` fechaFab · `8` fechaVenc · `9` descripción |
| `07` | Editar | `1` nombre · `2` nIdAlmacen · `3` nIdCategoria · `4` nIdProducto · `5` nIdCatProd |
| `08` | Activar / dar de baja | `1` nIdProducto · `2` bEstado |

La opción `06` añade un décimo parámetro que **no viaja en el formulario**: el id del usuario,
que el controlador saca del token para firmar el movimiento de entrada del lote inicial.

**Respuesta de `03`** — la vista principal del inventario. Desde que un producto puede tener
varios lotes, la fila **resume sus partidas**: `nLotes` las cuenta, `nCantidad` suma la
existencia, `nValor` suma cantidad × precio y `dFechaVenc` es el vencimiento más próximo.
El detalle lote a lote lo da `/InventarioService/Lote`.

```json
[ { "nIdCatProd": 1, "nIdAlmacen": 1, "sNombreAlmacen": "Almacén Central Satipo",
    "nIdCategoria": 1, "sNombreCategoria": "Café Orgánico",
    "nIdProducto": 1, "sNombreProducto": "Café Orgánico Tostado Medio",
    "nLotes": 2, "nCantidad": 205, "sNombreUM": "Kilogramos", "nValor": 7910,
    "dFechaVenc": "2027-04-02", "sEstado": "Activo" } ]
```

**Respuesta de `05`** — solo lo que el modal de edición necesita:
```json
[ { "nIdCatProd": 1, "nIdAlmacen": 1, "nIdCategoria": 1,
    "nIdProducto": 1, "sNombreProducto": "Café Orgánico Tostado Medio" } ]
```

### Qué dejó de hacer la opción `07`

La edición de un producto se quedó con lo que de verdad le pertenece: **nombre, almacén y
categoría**. Cantidad, precio, unidad y fechas eran del lote y ahora se mantienen desde
`/InventarioService/Lote`; la existencia solo la mueve `/InventarioService/Movimiento`.

Esto cierra de raíz el defecto histórico de esta opción, documentado en `06-hallazgos.md`
como C-02: el frontend enviaba diez valores y el procedimiento leía once, así que
`@nIdCatProd` y `@nIdLote` quedaban en `NULL` y dos de los cuatro `UPDATE` no afectaban a
ninguna fila —cambiar un producto de almacén no funcionaba, y cambiar su vencimiento
tampoco—, pero la respuesta seguía siendo `'1|Se actualizó con éxito'`. Con cinco parámetros
y dos `UPDATE`, ya no hay desalineación posible.

## 6.1. `POST /InventarioService/Lote`

Procedimiento: `USP_MNT_Lotes`. Mantiene las partidas de un producto: cada lote tiene su
código, sus fechas, su unidad, su precio y su existencia.

| `sOpcion` | Operación | `pParametro` (posiciones) | Rol |
|---|---|---|---|
| `01` | Listar lotes | `1` nIdAlmacen · `2` nIdCategoria · `3` nIdProducto (`0` = todos) | cualquiera |
| `02` | Obtener lote por id | `1` nIdDetProd | cualquiera |
| `03` | Insertar | `1` nIdProducto · `2` código *(vacío = automático)* · `3` fechaFab · `4` fechaVenc · `5` nIdUnidadMedida · `6` cantidad inicial · `7` precio · `8` descripción | admin / supervisor |
| `04` | Editar | `1` nIdDetProd · `2` código · `3` fechaFab · `4` fechaVenc · `5` nIdUnidadMedida · `6` precio · `7` descripción | admin / supervisor |
| `05` | Activar / dar de baja | `1` nIdDetProd · `2` bEstado | admin / supervisor |
| `06` | Listar productos del combo | `1` nIdAlmacen (`0` = todos) | cualquiera |

La opción `03` recibe un noveno parámetro añadido por el controlador: el id del usuario del
token, que firma la entrada inicial del lote.

Las opciones `03` y `04` rechazan una unidad de medida distinta de la usada por los demás
lotes del producto. Productos agrega todas las existencias y presenta una sola U.M.; mezclar
kilogramos, paquetes o unidades produciría un total incorrecto (D-31).

**Respuesta de `01`**
```json
[ { "nIdDetProd": 1, "nIdProducto": 1, "sNombreProducto": "Café Orgánico Tostado Medio",
    "nIdAlmacen": 1, "sNombreAlmacen": "Almacén Central Satipo",
    "nIdCategoria": 1, "sNombreCategoria": "Café Orgánico",
    "nIdLote": 1, "sNombreLote": "CAF0001",
    "dFechaFab": "2026-04-02", "dFechaVenc": "2027-04-02", "nDiasRestantes": 212,
    "nCantidad": 85, "sNombreUM": "Kilogramos", "nPrecio": 38, "sEstado": "Activo" } ]
```

Reglas que aplica el procedimiento y que responden con `cod = "0"`:

- el producto no existe o está dado de baja;
- la unidad de medida no coincide con los demás lotes del producto;
- la fecha de vencimiento no es posterior a la de fabricación;
- el código de lote ya existe (`TBL_LOTE.sNombreLote` es único);
- se intenta dar de baja un lote que todavía tiene existencia.

**La cantidad no está en la opción `04` a propósito.** Corregir una existencia es un ajuste,
y un ajuste deja constancia de quién y por qué. Ver la sección siguiente.

## 6.2. `POST /InventarioService/Movimiento`

Procedimiento: `USP_MNT_Movimientos`. Es el único sitio donde cambia la existencia de un lote.

| `sOpcion` | Operación | `pParametro` (posiciones) | Rol |
|---|---|---|---|
| `01` | Kardex | `1` nIdAlmacen · `2` nIdProducto · `3` nIdDetProd · `4` sTipo · `5` desde · `6` hasta | cualquiera |
| `02` | Registrar movimiento | `1` nIdDetProd · `2` sTipo · `3` cantidad · `4` motivo | E y S: cualquiera · A: admin / supervisor |
| `03` | Listar lotes del combo | `1` nIdAlmacen · `2` nIdProducto | cualquiera |
| `04` | Totales del kardex | los mismos seis filtros de `01` | cualquiera |

Todos los filtros de `01` y `04` son opcionales: `0` o vacío significa «sin filtrar».
La opción `02` recibe un quinto parámetro añadido por el controlador: el id del usuario del
token. **El formulario nunca decide quién firma un movimiento.**

`sTipo` es `E` entrada, `S` salida o `A` ajuste:

- **Entrada** suma la cantidad al saldo del lote.
- **Salida** la resta, y se rechaza si deja el lote en negativo.
- **Ajuste** recibe la **cantidad contada** en el inventario físico, no la diferencia: el
  procedimiento calcula el delta, lo guarda con signo y lo muestra en el kardex como entrada
  o salida. Si la cantidad contada coincide con la existencia, responde `cod = "0"`.

El motivo es obligatorio en los tres casos.

**Respuesta de `01`** — el kardex, con las columnas clásicas:
```json
[ { "nIdMovimiento": 35, "nIdDetProd": 1, "dFechaMov": "2026-08-12 23:36",
    "sTipo": "S", "sTipoNombre": "Salida", "nEntrada": 0, "nSalida": 15, "nSaldo": 85,
    "sMotivo": "Despacho a tienda propia Satipo",
    "sNombrePersona": "Usuario Demo Asistente", "sNombreLote": "CAF0001",
    "sNombreProducto": "Café Orgánico Tostado Medio",
    "sNombreAlmacen": "Almacén Central Satipo", "sNombreUM": "Kilogramos" } ]
```

Devuelve como mucho 500 filas, ordenadas de la más reciente a la más antigua.

**Respuesta de `04`**
```json
[ { "nMovimientos": 61, "nEntradas": 4847, "nSalidas": 512, "nAjustes": 4 } ]
```

**Respuesta de `02`**
```json
{ "cod": "1", "mensaje": "Se registró el movimiento. Saldo del lote: 80" }
```

El registro va en una transacción con `UPDLOCK` sobre el lote: si dos personas lo mueven a la
vez, la segunda lee el saldo ya actualizado en vez de pisarlo.

## 7. `/api/Zona` — el módulo REST

`ZonaController` no usa el patrón `sOpcion`. Recibe y devuelve objetos tipados.

### `GET /api/zona`
```json
[ { "sOpcion": null, "nIdZona": 1, "sNombre": "Junín", "sRutaImagen": "https://..." } ]
```
`sOpcion` aparece en la respuesta porque `ZonaEntity` reutiliza el mismo DTO para entrada y
salida; en las lecturas siempre viene `null`.

### `GET /api/zona/editar/{id}`
Devuelve un arreglo con un elemento (no un objeto).

### `POST /api/zona`
```json
{ "nIdZona": 0, "sNombre": "Ucayali", "sRutaImagen": "https://..." }
```
Respuesta: el string `"OK"` (texto plano, no JSON), o `""` si no se insertó ninguna fila.

### Limitaciones

- **No existe operación de actualización.** El procedimiento solo implementa `01` consultar todos, `02` consultar por id y `03` insertar.
- **No existe operación de baja.**
- Por eso, la pantalla "editar zona" del frontend **crea un duplicado** en lugar de actualizar. El componente carga la zona por id y luego llama al mismo `saveZona()`, que hace `POST` → insertar. Peor aún, borra el id explícitamente antes de enviar:

```typescript
// zona-form.component.ts
delete this.lZona.nIdZona;
```

- La comprobación de duplicados del procedimiento tampoco funciona (compara contra `LOWER(@sNombre)`), así que el duplicado se crea sin obstáculo. Ver `03-modelo-de-datos.md`, sección 4, hallazgo 10.

## 8. `POST /ClientesService` — fuera del alcance actual

La API publicada no expone este endpoint. El módulo completo se recuperó del historial, pero
se dejó fuera del árbol actual porque todavía no está integrado con los datos ni probado en
el recorrido de la demo. Puede restaurarse con los comandos de `10-decisiones.md`, D-19.

## 9. Tabla resumen de códigos

Los códigos **no significan lo mismo entre entidades**. Esta tabla es la referencia rápida:

| Código | Usuarios | Almacenes | Categorías | Productos | Lotes | Movimientos |
|---|---|---|---|---|---|---|
| `01` | Listar todos | Listar almacenes | Listar categorías | Listar almacenes | Listar lotes | Kardex |
| `02` | Listar con filtros | Obtener por id | Obtener por id | Listar categorías | Obtener por id | **Registrar** |
| `03` | Obtener por id | Listar zonas | **Insertar** | Listar productos | **Insertar** | Listar lotes |
| `04` | **Insertar** | Listar supervisores | **Editar** | Listar unidades | **Editar** | Totales |
| `05` | **Editar** | **Insertar** | **Baja / alta** | Obtener por id | **Baja / alta** | — |
| `06` | **Baja / alta** | **Editar** | — | **Insertar** | Listar productos | — |
| `07` | — | **Baja / alta** | — | **Editar** | — | — |
| `08` | — | — | — | **Baja / alta** | — | — |

En negrita, las operaciones de escritura (las que devuelven `cod`/`mensaje`).

El desplazamiento se debe a que cada entidad reserva los primeros códigos para las consultas
auxiliares que alimentan sus selectores. Productos necesita cuatro (almacenes, categorías,
tabla, unidades), así que sus escrituras empiezan en `06`.

Movimientos rompe la costumbre: su escritura es la `02`, justo detrás de la consulta que
alimenta la pantalla. Se numeró por orden de importancia, no por acumulación de selectores.

## 10. Ejemplos con `curl`

```bash
API=https://localhost:44360

# Login: de aquí sale el token que necesita todo lo demás
CREDENCIALES='{"sNombreUsuario":"demo.supervisor","sContrasenia":"SisgapoDemo2026!"}'
TOKEN=$(curl -sk -X POST $API/LoginService -H 'Content-Type: application/json' -d "$CREDENCIALES" | python -c 'import sys,json;print(json.load(sys.stdin)["sToken"])')

AUTH="Authorization: Bearer $TOKEN"
JSON='Content-Type: application/json'

# Listar usuarios (exige rol Administrador; con supervisor responde 403)
curl -k -X POST $API/UsuariosService -H "$JSON" -H "$AUTH" -d '{"sOpcion":"01","parametros":[]}'

# Listar el inventario completo
curl -k -X POST $API/InventarioService/Producto -H "$JSON" -H "$AUTH" -d '{"sOpcion":"03","parametros":["0","0"]}'

# Lotes del producto 1
curl -k -X POST $API/InventarioService/Lote -H "$JSON" -H "$AUTH" -d '{"sOpcion":"01","parametros":["0","0","1"]}'

# Kardex del lote 1
curl -k -X POST $API/InventarioService/Movimiento -H "$JSON" -H "$AUTH" -d '{"sOpcion":"01","parametros":["0","0","1","","",""]}'

# Registrar una salida de 5 unidades sobre el lote 1
curl -k -X POST $API/InventarioService/Movimiento -H "$JSON" -H "$AUTH" -d '{"sOpcion":"02","parametros":["1","S","5","Despacho a distribuidor"]}'

# Crear un almacén
curl -k -X POST $API/AlmacenesService -H "$JSON" -H "$AUTH" -d '{"sOpcion":"05","parametros":["Almacén Sur","Av. Lima 500","2","3"]}'

# Zonas (REST)
curl -k $API/api/zona -H "$AUTH"
```

El `-k` es necesario porque en local el certificado es autofirmado.

> `parametros` es un arreglo, no la cadena `pParametro`: la API arma el delimitado por `|` y
> rechaza cualquier valor que contenga ese carácter. Los movimientos no llevan el id del
> usuario en el arreglo: lo pone el controlador a partir del token.
