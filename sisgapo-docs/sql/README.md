# Scripts SQL corregidos

Versión ejecutable del esquema de SISGAPO. Los scripts originales están en
`sisgapo-web/src/scripts/` y **no se pueden ejecutar tal cual** — ver
`../03-modelo-de-datos.md`, sección 4 para el detalle de cada fallo.

Estos archivos no reemplazan a los originales: conviven con ellos. Los originales
quedan como evidencia del estado de 2021.

## Orden de ejecución

| # | Archivo | Qué hace |
|---|---|---|
| 01 | `01-esquema.sql` | Crea las 12 tablas, claves foráneas e índices. Reejecutable |
| 02 | `02-funcion-split.sql` | Función `dbo.Split` — la usan todos los SPs |
| 03 | `03-seed.sql` | Datos de demostración ampliados |
| 04 | `04-usp-login.sql` | `USP_MNT_Login` |
| 05 | `05-usp-almacenes.sql` | `USP_MNT_Almacenes` |
| 06 | `06-usp-categorias.sql` | `USP_MNT_Categorias` |
| 07 | `07-usp-productos.sql` | `USP_MNT_Productos` |
| 08 | `08-usp-usuarios.sql` | `USP_MNT_Usuarios` |
| 09 | `09-usp-zonas.sql` | `USP_MNT_Zonas` |
| 10 | `10-usp-panel.sql` | `USP_MNT_Panel` — panel de inicio |
| 11 | `11-usp-lotes.sql` | `USP_MNT_Lotes` — partidas de un producto |
| 12 | `12-usp-movimientos.sql` | `USP_MNT_Movimientos` — entradas, salidas, ajustes y kardex |

Los scripts `10`–`12` son módulos nuevos, no hay original que respetar. `07` sí
cambió de lógica: el listado de productos pasa a agregar sus lotes y la edición
deja de tocar existencias y fechas. Ver `../03-modelo-de-datos.md`.

Los scripts `04`–`09` son los originales con tres cambios mecánicos:
codificación normalizada a UTF-8, `ALTER PROCEDURE` → `CREATE PROCEDURE`
(afectaba solo a `05-usp-almacenes.sql`) y eliminación de `USE [DB_SISGAPO]`
(Azure SQL no permite `USE`). Salvo por las bajas de `05` y `06` —ver abajo—, **la
lógica T-SQL no se tocó**, incluidos sus bugs: están documentados en
`../06-hallazgos.md`, no corregidos aquí.

Las bajas sí cambiaron. `USP_MNT_Almacenes` (07) y `USP_MNT_Categorias` (05)
desactivaban sin comprobar nada, y con eso se podía dejar un producto activo
colgando de un almacén o de una categoría de baja —justo lo que verifica el
invariante «Productos activos en almacén o categoría de baja = 0». Ahora rechazan
la baja mientras queden productos activos, y un almacén no se puede reactivar si
su zona está de baja. Es la regla que `USP_MNT_Zonas` ya aplicaba con los
almacenes. Ver `../10-decisiones.md`, D-35.

## Cómo ejecutarlos

### Contra SQL Server en Docker (recomendado para desarrollo)

```bash
docker run -d --name sisgapo-db \
  -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD=Sisgapo!Demo2026" \
  -e "MSSQL_PID=Express" \
  -p 1433:1433 \
  mcr.microsoft.com/mssql/server:2022-latest

# esperar ~20 s a que arranque, luego crear la base
docker exec sisgapo-db /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'Sisgapo!Demo2026' -C \
  -Q "CREATE DATABASE DB_SISGAPO"

# ejecutar los scripts en orden
for f in [0-9][0-9]-*.sql; do
  echo ">>> $f"
  docker exec -i sisgapo-db /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P 'Sisgapo!Demo2026' -C -d DB_SISGAPO -b < "$f" || break
done
```

Cadena de conexión resultante para `appsettings.json`:

```
Server=localhost,1433;Database=DB_SISGAPO;User ID=sa;Password=Sisgapo!Demo2026;TrustServerCertificate=True
```

### Contra Azure SQL

Crea primero la base desde el portal (`CREATE DATABASE` no se ejecuta desde estos
scripts) y luego lanza los archivos `01`–`12` en orden con `sqlcmd`, Azure Data
Studio o SSMS. No incluyen `USE`, así que basta con seleccionar la base correcta.

### Con el script de carga (cualquiera de los tres destinos)

`cargar-base.ps1` recorre los doce archivos en orden sobre una base que ya
existe. Es el mismo trabajo que hace `db-init` en Docker, pero sirve también para
Azure SQL y para un SQL Server instalado en la máquina:

```powershell
# Azure SQL — la base se crea antes en el portal
.\cargar-base.ps1 -Servidor sisgapo.database.windows.net -Usuario sisgapoadmin

# SQL Server local con autenticación de Windows
.\cargar-base.ps1 -Servidor . -Integrado

# El contenedor de docker compose
.\cargar-base.ps1 -Servidor "localhost,14330" -Usuario sa
```

Pide la contraseña por consola en vez de recibirla por parámetro, para que no
quede en el historial. Se detiene en el primer error (`sqlcmd -b`), así que si
falla un script no deja la base a medias sin avisar. Y hay que lanzarlo **desde
PowerShell**: en `cmd`, Windows abre el `.ps1` con el programa asociado y
descarta los argumentos.

> **Codificación.** Los doce archivos llevan BOM UTF-8 y el script pasa
> `-f i:65001,o:65001`. Las dos cosas son necesarias: el `sqlcmd` de Windows lee
> un `.sql` sin BOM con la página de códigos ANSI, y entonces «Almacén Central
> Satipo» se guarda como «AlmacÃ©n Central Satipo». El `sqlcmd` del contenedor no
> tiene el problema, así que la carga por Docker salía bien y ocultaba el fallo.
> Si abres los archivos desde SSMS, el BOM es lo que hace que se lean bien.
> Comprobación rápida tras cargar:
> `SELECT COUNT(*) FROM TBL_ALMACEN WHERE sNombre LIKE '%Ã%';` debe dar 0.

**Ningún despliegue hace esto por ti.** La API solo invoca procedimientos: no hay
migraciones ni código que cree tablas al arrancar. Cada base nueva necesita esta
carga una vez.

## Verificación

`03-seed.sql` termina con dos `SELECT` de control. El primero cuenta las filas de
cada tabla y debe devolver:

```
TBL_DOCUMENTO      3
TBL_ROL            3
TBL_ZONA           5
TBL_USUARIO       10
TBL_LOGIN         10
TBL_ALMACEN        5
TBL_CATEGORIA      7
TBL_UNIDADMEDIDA   5
TBL_PRODUCTO      25
TBL_LOTE          33
TBL_DET_PRODUCTO  33
TBL_CAT_PROD      25
TBL_MOVIMIENTO    61
```

`TBL_LOTE` y `TBL_DET_PRODUCTO` tienen 33 filas y no 25 porque ocho productos
llevan dos partidas. `TBL_MOVIMIENTO` son las 33 entradas iniciales más 28
operaciones de las últimas ocho semanas.

El segundo comprueba los invariantes del inventario, que son los que hacen que el
panel de inicio se vea coherente. Debe devolver:

```
Valor del inventario activo                       81976
Productos activos                                    21
Productos dados de baja                               4
Lotes activos que vencen en 30 días                   2
Lotes activos que vencen en 90 días                   7
Lotes activos ya vencidos                             0
Productos de baja sin lote vencido                    0
Productos activos en almacén o categoría de baja      0
Productos con más de un lote                          8
Lotes cuyo saldo no cuadra con su kardex              0
```

La última línea es el invariante del módulo de movimientos: la existencia de un
lote es la suma de su kardex. Si deja de ser 0, alguien ha escrito en
`TBL_DET_PRODUCTO.nCantidad` sin pasar por `USP_MNT_Movimientos`. Tampoco se deben mezclar
unidades de medida entre lotes del mismo producto: el resumen de Productos agrega esas
cantidades. Ambas reglas las comprueban las pruebas de integración
(`sisgapo-api/Test/InventarioIntegracionTests.cs`).

Las fechas del seed son relativas a `GETDATE()`, así que estos números salen
iguales se cargue el script cuando se cargue. Si alguno se desvía, el catálogo
se ha tocado sin rehacer las cuentas — ver la cabecera de `03-seed.sql`.

Prueba de humo de los stored procedures, una vez cargado todo:

```sql
EXEC USP_MNT_Login     @sNombreUsuario = 'demo.supervisor';                  -- 1 fila; el hash se valida en la API
EXEC USP_MNT_Usuarios  @sOpcion = '01', @pParametro = '';                    -- 10 usuarios
EXEC USP_MNT_Almacenes @sOpcion = '01', @pParametro = '';                    -- 5 almacenes
EXEC USP_MNT_Almacenes @sOpcion = '04', @pParametro = '';                    -- 5 supervisores
EXEC USP_MNT_Categorias @sOpcion = '01', @pParametro = '';                   -- 7 categorías
EXEC USP_MNT_Productos @sOpcion = '03', @pParametro = '';                    -- 25 productos
EXEC USP_MNT_Zonas     @sOpcion = '01', @nIdZona = 0, @sNombre = '', @sRutaImagen = '';  -- 5 zonas
EXEC USP_MNT_Lotes     @sOpcion = '01', @pParametro = '0|0|0';               -- 33 lotes
EXEC USP_MNT_Lotes     @sOpcion = '01', @pParametro = '0|0|1';               -- 2 lotes del producto 1
EXEC USP_MNT_Movimientos @sOpcion = '01', @pParametro = '|||||';             -- kardex completo
EXEC USP_MNT_Movimientos @sOpcion = '04', @pParametro = '|||||';             -- totales
```

> `USP_MNT_Zonas` exige los cuatro parámetros: `@sRutaImagen` no tiene valor por
> defecto. Es la única firma distinta del conjunto.

## Credenciales de demostración

Las contraseñas se almacenan con bcrypt. Para el recorrido público se usan estas cuentas:

| Usuario | Contraseña | Rol | Para probar |
|---|---|---|---|
| `demo.admin` | `SisgapoDemo2026!` | Administrador | Todo, incluidos Usuarios y el mantenimiento de Zonas |
| `demo.supervisor` | `SisgapoDemo2026!` | Supervisor | Escrituras operativas y ajustes de inventario; ve Zonas pero no las edita |
| `demo.asistente` | `SisgapoDemo2026!` | Asistente | Panel, consultas y registro de entradas y salidas |

Las tres salen en la pantalla de acceso, con un botón por cuenta. El seed también
conserva estas cuentas históricas para revisar escenarios y responsables de almacén:

| Usuario | Rol | Para probar |
|---|---|---|
| `admin` | Administrador | Mantenimiento local, con clave propia que no se publica |
| `jose.m` | Supervisor | Almacén Central Satipo |
| `alex.quispe` | Supervisor | Almacén Norte Huaraz |
| `maria.ramirez` | Supervisor | Almacén Lima Callao |
| `carlos.mendoza` | Supervisor | Dos almacenes, uno de ellos inactivo |
| `lucia.fernandez` | Asistente | Rol sin casos de uso definidos |
| `jorge.salazar` | Asistente | **Usuario inactivo** — verifica el filtro de estado |

Las cuentas genéricas son credenciales públicas de demostración. Ver
`../06-hallazgos.md`, S-02.
