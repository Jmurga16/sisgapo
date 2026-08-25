# Scripts SQL corregidos

Versión ejecutable del esquema de SISGAPO. Los scripts originales están en
`sisgapo-web/src/scripts/` y **no se pueden ejecutar tal cual** — ver
`../03-modelo-de-datos.md` §4 para el detalle de cada fallo.

Estos archivos no reemplazan a los originales: conviven con ellos. Los originales
quedan como evidencia del estado de 2021.

## Orden de ejecución

| # | Archivo | Qué hace |
|---|---|---|
| 01 | `01-esquema.sql` | Crea las 11 tablas, claves foráneas e índices. Reejecutable |
| 02 | `02-funcion-split.sql` | Función `dbo.Split` — la usan todos los SPs |
| 03 | `03-seed.sql` | Datos de demostración ampliados |
| 04 | `04-usp-login.sql` | `USP_MNT_Login` |
| 05 | `05-usp-almacenes.sql` | `USP_MNT_Almacenes` |
| 06 | `06-usp-categorias.sql` | `USP_MNT_Categorias` |
| 07 | `07-usp-productos.sql` | `USP_MNT_Productos` |
| 08 | `08-usp-usuarios.sql` | `USP_MNT_Usuarios` |
| 09 | `09-usp-zonas.sql` | `USP_MNT_Zonas` |

Los scripts `04`–`09` son los originales con tres cambios mecánicos:
codificación normalizada a UTF-8, `ALTER PROCEDURE` → `CREATE PROCEDURE`
(afectaba solo a `05-usp-almacenes.sql`) y eliminación de `USE [DB_SISGAPO]`
(Azure SQL no permite `USE`). **La lógica T-SQL no se tocó**, incluidos sus bugs
—están documentados en `../06-hallazgos.md`, no corregidos aquí.

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
for f in 0*.sql; do
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
scripts) y luego lanza los archivos `01`–`09` en orden con `sqlcmd`, Azure Data
Studio o SSMS. No incluyen `USE`, así que basta con seleccionar la base correcta.

## Verificación

`03-seed.sql` termina con un `SELECT` de conteos. Debe devolver:

```
TBL_DOCUMENTO      3
TBL_ROL            3
TBL_ZONA           5
TBL_USUARIO        6
TBL_LOGIN          6
TBL_ALMACEN        5
TBL_CATEGORIA      4
TBL_UNIDADMEDIDA   5
TBL_PRODUCTO      12
TBL_LOTE          12
TBL_DET_PRODUCTO  12
TBL_CAT_PROD      12
```

Prueba de humo de los stored procedures, una vez cargado todo:

```sql
EXEC USP_MNT_Login     @sNombreUsuario = 'admin', @sContrasenia = '123456';  -- 1 fila, nIdRol = 1
EXEC USP_MNT_Usuarios  @sOpcion = '01', @pParametro = '';                    -- 6 usuarios
EXEC USP_MNT_Almacenes @sOpcion = '01', @pParametro = '';                    -- 5 almacenes
EXEC USP_MNT_Almacenes @sOpcion = '04', @pParametro = '';                    -- 3 supervisores
EXEC USP_MNT_Categorias @sOpcion = '01', @pParametro = '';                   -- 4 categorías
EXEC USP_MNT_Productos @sOpcion = '03', @pParametro = '';                    -- 12 productos
EXEC USP_MNT_Zonas     @sOpcion = '01', @nIdZona = 0, @sNombre = '', @sRutaImagen = '';  -- 5 zonas
```

> `USP_MNT_Zonas` exige los cuatro parámetros: `@sRutaImagen` no tiene valor por
> defecto. Es la única firma distinta del conjunto.

## Credenciales de demostración

Todas las cuentas usan la contraseña `123456`, en texto plano, como en el diseño
original.

| Usuario | Rol | Para probar |
|---|---|---|
| `admin` | Administrador | Acceso completo |
| `alex.quispe` | Supervisor | Almacén Central Satipo |
| `maria.ramirez` | Supervisor | Dos almacenes asignados |
| `carlos.mendoza` | Supervisor | Incluye un almacén inactivo |
| `lucia.fernandez` | Asistente | Rol sin casos de uso definidos |
| `jorge.salazar` | Asistente | **Usuario inactivo** — verifica el filtro de estado |

Son credenciales públicas de demostración. Ver `../06-hallazgos.md` §S-02.
