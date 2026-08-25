# Scripts SQL originales (2021) — NO EJECUTAR

Esta carpeta se conserva como **evidencia del estado original del proyecto**. Los
scripts que hay aquí **no reconstruyen la base de datos**: falta la columna
`TBL_USUARIO.nRol`, `USP_MNT_Almacenes.sql` usa `ALTER` en vez de `CREATE`, dos
archivos duplican objetos y todos llevan un `USE` que Azure SQL no admite.

El detalle de cada fallo está en `sisgapo-docs/03-modelo-de-datos.md` seccion 4.

## Qué usar en su lugar

**`sisgapo-docs/sql/`** — version corregida, mantenida y verificada. Es la que carga
`docker compose up -d` desde la raiz del repositorio.

La decision de mantener las dos copias esta explicada en
`sisgapo-docs/10-decisiones.md` (D-06 y D-13).
