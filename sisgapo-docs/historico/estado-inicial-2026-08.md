# Estado inicial del proyecto — agosto de 2026

Lo que había el día que se recuperó el proyecto, **antes de cualquier arreglo**. Era la
sección 4 de `../01-analisis-general.md`; se mueve aquí porque describe un estado que ya no
existe, y porque es el punto de partida contra el que se mide todo lo demás. Todo lo de
esta página se comprobó ejecutándolo, no se infirió.

## La infraestructura de Azure ya no existía

```
servidorsqlsan.database.windows.net    → NXDOMAIN (no existe)
sisgapoback.azurewebsites.net          → NXDOMAIN (no existe)
sisgapo.azurewebsites.net              → NXDOMAIN (no existe)
```

Los hostnames de Static Web Apps (`blue-sea-0c3542710`, `yellow-meadow-0e36f1a10`) sí
resolvían, pero `*.azurestaticapps.net` apunta a un frontend compartido: que resuelva
**no** confirma que el recurso siga activo.

**Consecuencia práctica: no había datos que exportar.** Lo que se llamó «migración de base
de datos» fue en realidad una **reconstrucción desde los scripts SQL**. Eso simplificó mucho
el trabajo, y significó también que se podía elegir cualquier motor sin costo de migración
(la elección está en `../09-decisiones.md`, D-01).

**Primera acción que se recomendó:** entrar al portal de Azure y confirmar qué recursos
seguían existiendo y qué se estaba facturando. El análisis de costos está en
`../06-infraestructura.md`, sección 2.

## El backend compilaba, con avisos

```
dotnet build SISGAPO_Back.sln
→ Build succeeded. 12 Warning(s), 0 Error(s).
```

Avisos de entonces: `NETSDK1138` (`net5.0` fuera de soporte), `NU1903`/`NU1902`
(`System.Data.SqlClient` con CVE) y `NU1701` ×6 (paquetes de .NET Framework restaurados
contra `net5.0`, incluido `Microsoft.ApplicationBlocks.Data`). Tras la migración a .NET 8 y
la limpieza de dependencias, `dotnet build` compila con **0 avisos** (D-01, S-05 y S-06 de
`hallazgos-2026.md`).

## El frontend compilaba, con un flag

```
npm install --legacy-peer-deps                                → 1481 paquetes, 32 s, exit 0
npx ng build --prod                                           → FALLA
NODE_OPTIONS=--openssl-legacy-provider npx ng build --prod    → OK, 32 s
```

El error sin el flag es `error:0308010C:digital envelope routines::unsupported`.

Bundle resultante: `main-es2015` 877 kB, `main-es5` 1020 kB, `styles` 213 kB.
Salida en `dist/SISGAPO-Front`.

**Esto fue una buena noticia importante.** Webpack 4 (que usa Angular 9) llama a
`crypto.createHash('md4')`, y OpenSSL 3 —que trae Node 17+— ya no expone MD4. El flag
`--openssl-legacy-provider` lo reactiva. Es decir: **no hacía falta actualizar Angular para
desplegar la demo.** Verificado en Node 22.23.1. El flag quedó fijado después en los
scripts de `package.json` con `cross-env`.

## Autenticación y autorización: decorativas

El estado original era una API pública con contraseñas en texto plano y un rol modificable
desde `localStorage`:

- `TBL_LOGIN` guardaba la contraseña sin cifrar y `USP_MNT_Usuarios` opción 03 la devolvía
  al cliente dentro de un `SELECT *`.
- Ningún controlador llevaba `[Authorize]`; `UseAuthorization()` iba sin
  `UseAuthentication()` delante.
- `app-routing.module.ts` no declaraba un solo `canActivate`.

La reproducción y los arreglos están en `hallazgos-2026.md`, S-02 a S-04.

## Había secretos en la copia local, no en el repositorio

- `sisgapo-api/SISGAPO_API/appsettings.json:11` — cadena de conexión completa con servidor,
  usuario (`ink`) y contraseña en claro.
- `sisgapo-api/Data/ProductoData.cs:190` — contraseña de una cuenta de Gmail, dentro de un
  bloque de código comentado que enviaba notificaciones por correo.

Aunque el servidor SQL ya no existiera, **esas contraseñas se consideraron comprometidas**.
La verificación del historial de Git y su rectificación —la contraseña de SonarQube que sí
estuvo publicada cuatro años— están en `hallazgos-2026.md`, S-01 y S-10.

## Ninguno de los dos proyectos estaba bajo control de versiones localmente

```
sisgapo-api  → fatal: not a git repository
sisgapo-web  → fatal: not a git repository
```

Existían workflows de GitHub Actions en `sisgapo-web/.github/workflows/`, así que en algún
momento el frontend estuvo en GitHub. Para portafolio, fue lo primero que hubo que
resolver: **sin repositorio público no hay nada que enseñar salvo la pantalla.** Se resolvió
en agosto de 2026 con un monorepo único y los dos historiales de 2021 importados (D-18).

## Métricas del código al recuperarlo

### Backend — 2 271 líneas de C#

| Proyecto | Archivos | Líneas | Comentario |
|---|---|---|---|
| `Data` | 9 | 1 290 | La capa más pesada; `Conexion.cs` sola eran 253 |
| `SISGAPO_API` | 6 controllers + Startup/Program | 453 | Controllers con lógica repetida |
| `Entity` | 8 | 255 | DTOs; 5 clases vacías sin usar |
| `Business` | 7 | 236 | Pass-through puro |
| `Test` | 2 | 37 | 1 test, roto |

### Frontend — 96 archivos en `src/`

- 14 componentes (5 listas, 4 modales, login, inicio, nav-menu, zona-form, app)
- 6 servicios (`login`, `panel`, `usuarios`, `almacenes`, `zona`, `inventario`)
- 8 archivos de modelos compartidos
- 13 scripts SQL
- 12 archivos `.spec.ts` — predominaban pruebas de existencia, con poca cobertura de comportamiento

### Nivel de duplicación

Era el rasgo más visible del código:

- Los seis controllers repetían el mismo bloque `if (sOpcion == "01" || ...) { try { ... } catch { log; throw; } }`, con solo el rango de códigos cambiando.
- Los siete `*Business.cs` eran idénticos salvo el nombre del tipo.
- Cada `*Data.cs` repetía el bloque `while (dr.Read()) { new Entidad(); ... .Add(); }` una vez por cada `sOpcion`.
- `CreacionTablasParte2.sql` era un duplicado literal de la segunda mitad de `CreacionTablas.sql`.
- `PoblacionDatosParte2.sql` duplicaba datos de `PoblacionDatos.sql`.

Nada de esto rompía la aplicación, pero inflaba el código a ~2 200 líneas donde ~900
habrían bastado. Lo que se hizo con ello está en `hallazgos-2026.md`, D-08, y en
`../09-decisiones.md`, D-44: la parte barata se limpió y el genérico se descartó a
propósito.
