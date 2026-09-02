# 01 — Análisis general

## 1. Contexto de negocio

Extraído del documento original `Documento de Especificación de CUS.docx` (v4.0, julio 2021).

**Cliente ficticio:** comercializadora *Nuevo Amanecer*, ubicada en Satipo (Junín, Perú).
Compra café a agricultores, lo almacena en varios almacenes a nivel nacional y lo distribuye
a plantas procesadoras.

**Problema declarado:**
- No hay registro ni control del inventario.
- No hay trazabilidad de entradas y salidas de productos.
- No hay reportes automatizados de movimientos por fecha.
- No hay seguimiento de despachos (destino ni cantidad).

**Solución propuesta:** un sistema web de gestión de almacén.

**Procesos de negocio identificados:**

| ID | Proceso | ¿Implementado? |
|---|---|---|
| PN1 | Gestión de almacenes (almacén + supervisor + zona) | Sí |
| PN2 | Gestión de usuarios (crear, editar, eliminar; perfiles) | Sí |
| PN3 | Gestión de abastecimiento (proveedores) | **No** |

**Actores:**
- **Administrador** — crea, edita y elimina usuarios, almacenes, zonas y productos.
- **Supervisor** — responsable de un almacén; gestiona categorías.
- *(Asistente aparece como rol en la BD y en el filtro del frontend, pero no tiene casos de uso definidos.)*

> Nota sobre autoría: la carátula del documento de CUS lista seis integrantes de equipo y
> atribuye la redacción del documento a dos de ellos. Si vas a presentar el proyecto como
> trabajo propio, conviene ser preciso sobre qué parte hiciste tú (por ejemplo: "desarrollé el
> backend y el frontend completos de un proyecto de equipo"). Ver `10-decisiones.md`, D-09.

## 2. Alcance funcional implementado

Doce casos de uso especificados, organizados en tres iteraciones.

| CUS | Caso de uso | Actor | Estado en el código |
|---|---|---|---|
| 0001 | Crear Usuario | Administrador | Implementado (`sOpcion 04`) |
| 0002 | Editar Usuario | Administrador | Implementado (`sOpcion 05`) |
| 0003 | Eliminar Usuario | Administrador | Implementado como baja lógica (`sOpcion 06`) |
| 0004 | Crear Zona | Administrador | Implementado (endpoint REST aparte) |
| 0005 | Agregar Almacén | Administrador | Implementado (`sOpcion 05`) |
| 0006 | Editar Almacén | Administrador | Implementado (`sOpcion 06`) |
| 0007 | Eliminar Almacén | Administrador | Implementado como baja lógica (`sOpcion 07`) |
| 0008 | Agregar Producto | Administrador | Implementado (`sOpcion 06`) |
| 0009 | Autenticar Usuario | Ambos | Implementado parcialmente — ver la sección 4 |
| 0010 | Crear Categoría | Supervisor | Implementado (`sOpcion 03`) |
| 0011 | Editar Categoría | Supervisor | Implementado (`sOpcion 04`) |
| 0012 | Eliminar Categoría | Supervisor | Implementado como baja lógica (`sOpcion 05`) |

**Cobertura funcional: 12/12 casos de uso tienen código.** Es un alcance completo y cerrado,
lo cual es una fortaleza para una demo: no hay pantallas a medias.

**Desviaciones respecto a la especificación:**

- CUS-0003, 0007 y 0012 especifican que *el sistema elimina definitivamente*. La
  implementación hace **baja lógica** (`UPDATE ... SET bEstado = 0`). La implementación es la
  decisión correcta; la especificación es la que está mal.
- CUS-0009 especifica un **límite de intentos de autenticación**. No está implementado.
- CUS-0001 especifica validaciones (DNI de 8 dígitos, teléfono de 9, mayoría de edad).
  Están en el frontend; no hay validación equivalente en el backend.
- PN3 (abastecimiento / proveedores) no se implementó. Existe un módulo `Cliente` en el
  backend que parece un intento abandonado en esa dirección: tiene controller, business y
  data, pero **no tiene tabla, ni stored procedure, ni pantalla**. Es código muerto que
  revienta si se invoca. Ver `06-hallazgos.md`, C-11.

## 3. Stack tecnológico

### Backend — `sisgapo-api/`

| Componente | Versión | Notas |
|---|---|---|
| .NET | 5.0 | **Fin de soporte: 8 de mayo de 2022** |
| ASP.NET Core Web API | 5.0 | Patrón `Startup.cs` clásico |
| `Microsoft.Data.SqlClient` | 5.1.6 | Sustituye a `System.Data.SqlClient` 4.8.2, que tenia 2 CVE |
| `Swashbuckle.AspNetCore` | 5.6.3 | Swagger, solo habilitado en Development |
| `NLog` | 4.7.10 | **Sin archivo de configuración** → no escribe nada |
| `Microsoft.EntityFrameworkCore.SqlServer` | 5.0.1 | **Referenciado pero jamás usado** |
| `Microsoft.AspNet.WebApi.Cors` | 5.2.7 | Paquete de .NET Framework, inútil aquí |
| `xUnit` | 2.4.1 | 1 test, que no puede pasar |

Cuatro proyectos: `SISGAPO_API` (web), `Business`, `Data`, `Entity`, más `Test`.

### Frontend — `sisgapo-web/`

| Componente | Versión | Notas |
|---|---|---|
| Angular | 9.1.2 | Salió en 2020; fuera de soporte |
| Angular Material + CDK | 9.2.4 | — |
| Bootstrap | 5.0.2 | Conviviendo con Material y con `@ng-bootstrap` 6 (que espera Bootstrap 4) |
| `@ng-bootstrap/ng-bootstrap` | 6.2.0 | Desajuste de versión con Bootstrap 5 |
| `@ng-select/ng-select` | 7.0.1 | — |
| SweetAlert2 | 11.0.18 | Diálogos y alertas |
| TypeScript | 3.8.3 | — |
| TSLint | 6.1.0 | Deprecado en favor de ESLint |
| Protractor | 5.4.3 | Deprecado; carpeta `e2e/` sin tests reales |

### Base de datos

SQL Server (desplegado como Azure SQL Database). **Toda la lógica de negocio está en 6
stored procedures.** El C# solo despacha llamadas y mapea `IDataReader` a DTOs.

### Infraestructura original (Azure)

Reconstruida desde las plantillas ARM en
`sisgapo-api/SISGAPO_API/Properties/ServiceDependencies/`:

| Recurso | SKU | Costo aproximado (precio de lista, East US) |
|---|---|---|
| App Service Plan | **S1 Standard** | ~US$ 73/mes |
| Azure SQL Database | Basic, 5 DTU, 2 GB | ~US$ 5/mes |
| Azure Static Web Apps | Free | US$ 0 |
| **Total** | | **~US$ 78/mes** |

El App Service Plan S1 es el 94 % del costo. Para una demo, un S1 es un sobredimensionamiento
enorme: F1 (gratis) o B1 bastan de sobra.

> Verifica el costo real en el portal de Azure. Estos son precios de lista y pueden no
> reflejar tu suscripción, descuentos ni el consumo real.

## 4. Estado real verificado

Todo lo de esta sección fue comprobado ejecutándolo, no inferido.

### La infraestructura de Azure ya no existe

```
servidorsqlsan.database.windows.net    → NXDOMAIN (no existe)
sisgapoback.azurewebsites.net          → NXDOMAIN (no existe)
sisgapo.azurewebsites.net              → NXDOMAIN (no existe)
```

Los hostnames de Static Web Apps (`blue-sea-0c3542710`, `yellow-meadow-0e36f1a10`) sí
resuelven, pero `*.azurestaticapps.net` apunta a un frontend compartido: que resuelva **no**
confirma que el recurso siga activo.

**Consecuencia práctica: no hay datos que exportar.** Lo que llamas "migración de base de
datos" es en realidad una **reconstrucción desde los scripts SQL**. Eso simplifica mucho el
trabajo — y también significa que puedes elegir cualquier motor sin costo de migración.

**Primera acción recomendada:** entra al portal de Azure y confirma qué recursos siguen
existiendo y qué se está facturando. Es posible que ya no estés pagando nada.

### El backend compila

```
dotnet build SISGAPO_Back.sln
→ Build succeeded. 2 Warning(s), 0 Error(s). (3.2 s)
```

Warnings relevantes:
- `NETSDK1138` — `net5.0` fuera de soporte.
- ~~`NU1903` / `NU1902`~~ — resueltos al migrar a `Microsoft.Data.SqlClient`.
- `NU1701` ×6 — paquetes de .NET Framework restaurados contra `net5.0`
  (`Microsoft.ApplicationBlocks.Data`, `Microsoft.AspNet.WebApi.*`).

### El frontend compila (con un flag)

```
npm install --legacy-peer-deps                                → 1481 paquetes, 32 s, exit 0
npx ng build --prod                                           → FALLA
NODE_OPTIONS=--openssl-legacy-provider npx ng build --prod    → OK, 32 s
```

El error sin el flag es `error:0308010C:digital envelope routines::unsupported`.

Bundle resultante: `main-es2015` 877 kB, `main-es5` 1020 kB, `styles` 213 kB.
Salida en `dist/SISGAPO-Front`.

**Esto es una buena noticia importante.** Webpack 4 (que usa Angular 9) llama a
`crypto.createHash('md4')`, y OpenSSL 3 —que trae Node 17+— ya no expone MD4. El flag
`--openssl-legacy-provider` lo reactiva. Es decir: **no necesitas actualizar Angular para
desplegar la demo.** Verificado en Node 22.23.1.

### La autenticación no protege nada

- `TBL_LOGIN` guarda contraseñas en **texto plano**. El seed crea `admin` / `123456`.
- `USP_MNT_Login` compara con `=` directo y devuelve un número de fila y un rol.
- El frontend guarda `localStorage.setItem('Rol', ...)` y navega a `/inicio`.
- **No se emite ningún token.** Las llamadas siguientes no llevan credencial alguna.
- La API no tiene `[Authorize]` en ningún controller, ni `UseAuthentication()` en el pipeline.
- Angular no tiene ningún guard `CanActivate`: escribir `/usuarios` en la barra de
  direcciones entra directo, sin pasar por login.

En términos prácticos: **la API es completamente pública.** Cualquiera con la URL puede
listar, crear y borrar usuarios. Ver `06-hallazgos.md`, S-03 y S-04.

### Habia secretos en la copia local, no en el repositorio

- `sisgapo-api/SISGAPO_API/appsettings.json:11` — cadena de conexión completa con servidor,
  usuario (`ink`) y contraseña en claro.
- `sisgapo-api/Data/ProductoData.cs:190` — contraseña de una cuenta de Gmail, dentro de un
  bloque de código comentado que enviaba notificaciones por correo.

Aunque el servidor SQL ya no exista, **esas contraseñas deben considerarse comprometidas**.
Si están reutilizadas en algún otro lado, cámbialas. Y no publiques el repositorio sin
limpiarlas primero (incluido el historial de git, si lo hay).

### Ninguno de los dos proyectos está bajo control de versiones localmente

```
sisgapo-api  → fatal: not a git repository
sisgapo-web  → fatal: not a git repository

[Resuelto en agosto de 2026: monorepo unico con los dos historiales importados.]
```

Existen workflows de GitHub Actions en `sisgapo-web/.github/workflows/`, así que en algún
momento el frontend estuvo en GitHub. Hoy no hay `.git` en el disco. Para portafolio, esto es
lo primero que hay que resolver: **sin repositorio público no hay nada que enseñar salvo la
pantalla.**

## 5. Métricas del código

### Backend — 2 271 líneas de C#

| Proyecto | Archivos | Líneas | Comentario |
|---|---|---|---|
| `Data` | 9 | 1 290 | La capa más pesada; `Conexion.cs` sola son 253 |
| `SISGAPO_API` | 6 controllers + Startup/Program | 453 | Controllers con lógica repetida |
| `Entity` | 8 | 255 | DTOs; 5 clases vacías sin usar |
| `Business` | 7 | 236 | Pass-through puro |
| `Test` | 2 | 37 | 1 test, roto |

### Frontend — 96 archivos en `src/`

- 14 componentes (5 listas, 4 modales, login, inicio, nav-menu, zona-form, app)
- 6 servicios (`login`, `panel`, `usuarios`, `almacenes`, `zona`, `inventario`)
- 8 archivos de modelos compartidos
- 13 scripts SQL
- 12 archivos `.spec.ts` — predominan pruebas de existencia, con poca cobertura de comportamiento

### Nivel de duplicación

Es el rasgo más visible del código. Ejemplos concretos:

- Los seis controllers repiten el mismo bloque `if (sOpcion == "01" || ...) { try { ... } catch { log; throw; } }`, con solo el rango de códigos cambiando.
- Los siete `*Business.cs` son idénticos salvo el nombre del tipo: instancian su `*Data`, llaman a un método y hacen `catch { log; throw; }`.
- Cada `*Data.cs` repite el bloque `while (dr.Read()) { new Entidad(); ... .Add(); }` una vez por cada `sOpcion`.
- `CreacionTablasParte2.sql` es un duplicado literal de la segunda mitad de `CreacionTablas.sql`.
- `PoblacionDatosParte2.sql` duplica datos de `PoblacionDatos.sql`.

Nada de esto rompe la aplicación, pero infla el código a ~2 200 líneas donde ~900 bastarían.

## 6. Valoración honesta para portafolio

**Lo que juega a favor:**
- Alcance funcional cerrado: 12 casos de uso, todos con pantalla e implementación.
- Separación en capas real y disciplinada (API / Business / Data / Entity), con nombres consistentes.
- Convenciones aplicadas coherentemente en las tres capas (notación húngara, `TBL_*`, `USP_MNT_*`).
- Documentación de análisis previa al código (casos de uso versionados). Eso no abunda.
- SQL no trivial: joins multi-tabla, baja lógica, filtros dinámicos con `IIF`, una función de split.
- Integración continua configurada (GitHub Actions → Azure Static Web Apps) y sonar-scanner presente.
- **Compila y corre hoy**, cinco años después. Eso no siempre pasa.

**Lo que juega en contra:**
- Versiones fuera de soporte en las dos puntas (.NET 5, Angular 9).
- Autenticación decorativa y contraseñas en claro. Es lo primero que un revisor técnico va a notar.
- Secretos en el repositorio.
- Sin inyección de dependencias: todo es `new` en campos de instancia, lo que hace el código no testeable.
- Tests que no son tests: 1 test de backend que no puede pasar, 8 specs de frontend sin adaptar.
- Duplicación alta y código muerto (módulo `Cliente`, `WeatherForecast`, `Correo.cs` vacío).
- Los scripts SQL no reconstruyen la base de datos (ver `03-modelo-de-datos.md`).

**Conclusión.** Es un proyecto universitario de 2021 y se nota, pero es un proyecto
universitario *terminado*, con documentación y con el ciclo completo (análisis → BD → API →
frontend → despliegue → CI). Eso vale más que la mitad de los portafolios.

La estrategia que rinde más no es reescribirlo: es **presentarlo con fecha, arreglar las
cuatro cosas que un revisor mira primero** (secretos, contraseñas hasheadas, autenticación
real, que se pueda levantar con un comando) y **documentar lo que harías distinto hoy**.
Esa última parte —el criterio— es lo que un cliente compra. Ver `08-plan-demo.md`.
