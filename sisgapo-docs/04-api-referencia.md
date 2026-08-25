# 04 — Referencia de la API

Base URL en desarrollo: `https://localhost:44360/`
Base URL en producción (histórica, ya no existe): `http://sisgapoback.azurewebsites.net/`

Swagger está disponible en `/swagger` **solo cuando el entorno es Development**.

> **Toda la API es pública.** No hay autenticación, ni tokens, ni `[Authorize]`. Cualquiera
> con la URL puede invocar cualquier endpoint, incluidos los de creación y baja de usuarios.
> Ver `06-hallazgos.md` §S-03.

## 1. Convención general

Cinco de los seis endpoints comparten el mismo contrato:

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

`ZonaController` es la excepción: usa REST convencional con cuerpos tipados (§7).

## 2. `POST /LoginService`

Único endpoint que no usa `sOpcion`.

**Request**
```json
{ "sNombreUsuario": "admin", "sContrasenia": "123456" }
```

**Response (credenciales válidas)**
```json
[ { "nIdRol": 1, "result": 1 } ]
```

**Response (credenciales inválidas)** — arreglo vacío `[]`.

`result` es un `ROW_NUMBER()`, no un código de estado: vale 1 para la primera coincidencia.
El frontend comprueba `value.length > 0 && value[0].result > 0`.

No se emite ningún token. La sesión es `localStorage.setItem('Rol', nIdRol)` en el navegador,
y nada más. Las peticiones posteriores no llevan credencial alguna.

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

**Respuesta de `03`** — `SELECT *` del join usuario + login, con `dFechaNac` como texto
`YYYY-MM-DD` además del `dFechaNacimiento` nativo. **Devuelve `sContrasenia` en texto plano.**

**Respuesta de `04`, `05`, `06`** — este endpoint **no sigue** el contrato `cod`/`mensaje`:
```json
{ "mensaje": "OK" }
```

`UsuarioData` construye `"OK"` en C# a partir de `ExecuteNonQuery() != 0`, en vez de leer un
mensaje del procedimiento. Es el único módulo así.

**Detalle a tener en cuenta:** la opción `04` genera el nombre de usuario automáticamente
(primer nombre + `.` + primer apellido) y siempre le añade un sufijo numérico por un error en
el contador. Ver `03-modelo-de-datos.md` §4 hallazgo 9.

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

Procedimiento: `USP_MNT_Productos`. Es el endpoint con más operaciones y el que más problemas
tiene.

| `sOpcion` | Operación | `pParametro` (posiciones) |
|---|---|---|
| `01` | Listar almacenes activos | *(vacío)* |
| `02` | Listar categorías activas | *(vacío)* |
| `03` | Listar productos (tabla principal) | *(vacío)* |
| `04` | Listar unidades de medida | *(vacío)* |
| `05` | Obtener producto por id | `1` nIdCatProd |
| `06` | Insertar | `1` nombre · `2` nIdAlmacen · `3` nIdCategoria · `4` nIdUnidadMedida · `5` cantidad · `6` precio · `7` fechaFab · `8` fechaVenc · `9` descripción |
| `07` | Editar | igual que `06`, más `10` nIdProducto · `11` nIdCatProd |
| `08` | Activar / dar de baja | `1` nIdProducto · `2` bEstado |

**Respuesta de `03`** — la vista principal del inventario, con seis joins:
```json
[ { "nIdCatProd": 1, "nIdAlmacen": 1, "sNombreAlmacen": "Almacén Central Satipo",
    "nIdCategoria": 1, "sNombreCategoria": "Café Orgánico",
    "nIdProducto": 1, "sNombreProducto": "Café Orgánico Tostado Medio",
    "nIdDetProd": 1, "nCantidad": 250, "sNombreUM": "Kilogramos", "nPrecio": 38,
    "sNombreLote": "CAF0001", "dFechaVenc": "2027-01-15", "sEstado": "Activo" } ]
```

### Defecto conocido en la opción `07`

**El frontend y el procedimiento no están de acuerdo sobre cuántos parámetros van.**

`productos-modal.component.ts` envía **10** valores, y el décimo es `nIdCatProd`:

```typescript
pParametro.push(this.formProducto.get("sDescripcion").value);   // posición 9
pParametro.push(this.formProducto.get("nIdCatProd").value);     // posición 10
```

`USP_MNT_Productos` opción `07` espera **11**:

```sql
SET @nIdProducto = (SELECT valor FROM @tParametro WHERE id = 10);   -- recibe nIdCatProd
SET @nIdCatProd  = (SELECT valor FROM @tParametro WHERE id = 11);   -- no llega nada → NULL
```

Consecuencias al editar un producto:

| `UPDATE` | Cláusula `WHERE` | Efecto real |
|---|---|---|
| `TBL_PRODUCTO` | `nIdProducto = @nIdProducto` | Funciona **por casualidad**: `@nIdProducto` recibe el `nIdCatProd`, y ambos identificadores van sincronizados mientras todo producto se cree por la opción `06` |
| `TBL_DET_PRODUCTO` | `nIdProducto = @nIdProducto` | Igual: funciona por la misma coincidencia |
| `TBL_CAT_PROD` | `nIdCatProd = NULL` | **0 filas, siempre.** No se puede mover un producto de almacén ni de categoría |
| `TBL_LOTE` | `nIdLote = NULL` | **0 filas, siempre.** No se pueden editar las fechas de fabricación ni de vencimiento |

Y el procedimiento igualmente responde `'1|Se actualizó con éxito'`, así que **la interfaz
muestra un mensaje de éxito mientras la mitad de los cambios se descarta en silencio**.

#### Reproducción verificada

Ejecutado contra SQL Server 2022 con el seed de `sql/03-seed.sql` cargado:

```sql
-- Se pide: mover al almacén 2 / categoría 2, cantidad 99, precio 99,
--          fechas 2026-06-06 y 2027-06-06
EXEC USP_MNT_Productos @sOpcion='07',
     @pParametro='RENOMBRADO POR EDICION|2|2|1|99|99|2026-06-06|2027-06-06|nueva desc|13';
-- → 1|Se actualizó con éxito
```

Resultado real:

```
TBL_PRODUCTO      nIdProducto 13 → 'RENOMBRADO POR EDICION'      ✔ cambió
TBL_DET_PRODUCTO  nCantidad 99, nPrecio 99, 'nueva desc'         ✔ cambió
TBL_CAT_PROD      nIdAlmacen 1, nIdCategoria 1                   ✘ NO cambió (se pidió 2 y 2)
TBL_LOTE          dFechaFab 2026-01-01, dFechaVenc 2027-01-01    ✘ NO cambió
```

En términos de producto: **cambiar un artículo de almacén no funciona, y cambiar su fecha de
vencimiento tampoco.** Para un sistema de gestión de almacén con control de caducidad, esas
son justamente las dos operaciones que dan sentido al software.

**Es el bug más importante que corregir antes de enseñar la demo**, porque editar un producto
es la acción que un cliente va a probar. La corrección es de una línea en el frontend
(enviar `nIdProducto` en la posición 10 y `nIdCatProd` en la 11) más asignar `@nIdLote` en el
procedimiento. Ver `09-mejoras-propuestas.md` §M-04.

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

- La comprobación de duplicados del procedimiento tampoco funciona (compara contra `LOWER(@sNombre)`), así que el duplicado se crea sin obstáculo. Ver `03-modelo-de-datos.md` §4 hallazgo 10.

## 8. `POST /ClientesService` — no funcional

`ClienteController`, `ClienteBusiness` y `ClienteData` existen y compilan, e implementan las
opciones `01`–`05` contra `USP_MNT_Clientes`.

**Ese procedimiento no existe, ni existe la tabla `TBL_CLIENTE`.** No hay script que los
cree ni pantalla en el frontend que los use. Cualquier llamada devuelve un error de SQL Server.

Es código muerto de un módulo que se empezó y no se terminó — probablemente el proceso PN3
(gestión de abastecimiento) del documento de casos de uso. La opción sensata para la demo es
eliminarlo. Ver `09-mejoras-propuestas.md` §M-05.

## 9. Tabla resumen de códigos

Los códigos **no significan lo mismo entre entidades**. Esta tabla es la referencia rápida:

| Código | Usuarios | Almacenes | Categorías | Productos |
|---|---|---|---|---|
| `01` | Listar todos | Listar almacenes | Listar categorías | Listar almacenes |
| `02` | Listar con filtros | Obtener por id | Obtener por id | Listar categorías |
| `03` | Obtener por id | Listar zonas | **Insertar** | Listar productos |
| `04` | **Insertar** | Listar supervisores | **Editar** | Listar unidades |
| `05` | **Editar** | **Insertar** | **Baja / alta** | Obtener por id |
| `06` | **Baja / alta** | **Editar** | — | **Insertar** |
| `07` | — | **Baja / alta** | — | **Editar** |
| `08` | — | — | — | **Baja / alta** |

En negrita, las operaciones de escritura (las que devuelven `cod`/`mensaje`).

El desplazamiento se debe a que cada entidad reserva los primeros códigos para las consultas
auxiliares que alimentan sus selectores. Productos necesita cuatro (almacenes, categorías,
tabla, unidades), así que sus escrituras empiezan en `06`.

## 10. Ejemplos con `curl`

```bash
API=https://localhost:44360

# Login
curl -k -X POST $API/LoginService \
  -H 'Content-Type: application/json' \
  -d '{"sNombreUsuario":"admin","sContrasenia":"123456"}'

# Listar usuarios
curl -k -X POST $API/UsuariosService \
  -H 'Content-Type: application/json' \
  -d '{"sOpcion":"01","pParametro":""}'

# Buscar usuarios: nombre contiene "Ma", cualquier rol (0), solo activos (1)
curl -k -X POST $API/UsuariosService \
  -H 'Content-Type: application/json' \
  -d '{"sOpcion":"02","pParametro":"Ma|0|1"}'

# Listar el inventario completo
curl -k -X POST $API/InventarioService/Producto \
  -H 'Content-Type: application/json' \
  -d '{"sOpcion":"03","pParametro":""}'

# Crear un almacén
curl -k -X POST $API/AlmacenesService \
  -H 'Content-Type: application/json' \
  -d '{"sOpcion":"05","pParametro":"Almacén Sur|Av. Lima 500|2|3"}'

# Dar de baja el almacén 5
curl -k -X POST $API/AlmacenesService \
  -H 'Content-Type: application/json' \
  -d '{"sOpcion":"07","pParametro":"5|0"}'

# Zonas (REST)
curl -k $API/api/zona
curl -k -X POST $API/api/zona \
  -H 'Content-Type: application/json' \
  -d '{"nIdZona":0,"sNombre":"Ucayali","sRutaImagen":"https://ejemplo.com/img.jpg"}'
```

El `-k` es necesario porque en local el certificado es autofirmado.

> Que estos comandos funcionen **sin ninguna credencial** es exactamente el problema descrito
> en §1. Sirve como demostración del hallazgo §S-03.
