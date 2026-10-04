# 01 — Análisis general

## 1. Contexto de negocio

Extraído del documento original `historico/Documento de Especificación de CUS.docx` (v4.0, julio 2021).

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
> backend y el frontend completos de un proyecto de equipo"). Ver `09-decisiones.md`, D-09.

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
| 0009 | Autenticar Usuario | Ambos | Implementado: bcrypt, JWT y límite de intentos (S-02, S-03, S-09) |
| 0010 | Crear Categoría | Supervisor | Implementado (`sOpcion 03`) |
| 0011 | Editar Categoría | Supervisor | Implementado (`sOpcion 04`) |
| 0012 | Eliminar Categoría | Supervisor | Implementado como baja lógica (`sOpcion 05`) |

**Cobertura funcional: 12/12 casos de uso tienen código.** Es un alcance completo y cerrado,
lo cual es una fortaleza para una demo: no hay pantallas a medias.

**Desviaciones respecto a la especificación:**

- CUS-0003, 0007 y 0012 especifican que *el sistema elimina definitivamente*. La
  implementación hace **baja lógica** (`UPDATE ... SET bEstado = 0`). La implementación es la
  decisión correcta; la especificación es la que está mal.
- CUS-0009 especifica un **límite de intentos de autenticación**. Está implementado con
  cinco solicitudes por IP y minuto; las siguientes reciben HTTP 429.
- CUS-0001 especifica validaciones (DNI de 8 dígitos, teléfono de 9, mayoría de edad).
  Se validan tanto en el frontend como en el backend.
- PN3 (abastecimiento / proveedores) no forma parte de la demo actual. El módulo histórico
  `Cliente` se recuperó y se documentó, pero se dejó fuera del árbol publicado hasta poder
  integrarlo y probarlo. Ver `09-decisiones.md`, D-19.

## 3. Stack tecnológico

### Backend — `sisgapo-api/`

| Componente | Versión | Notas |
|---|---|---|
| .NET | 8.0 (LTS) | Migrado desde 5.0, que llevaba fuera de soporte desde mayo de 2022 |
| ASP.NET Core Web API | 8.0 | Patrón `Startup.cs` clásico, conservado a propósito — ver `09-decisiones.md`, D-05 |
| `Microsoft.Data.SqlClient` | 5.1.6 | Sustituye a `System.Data.SqlClient` 4.8.2, que tenía 2 CVE |
| `Swashbuckle.AspNetCore` | 6.6.2 | Swagger, solo habilitado en Development |
| `NLog` | 5.3.4 | Con `nlog.config` a consola y archivo |
| `xUnit` | 2.9.3 | 27 pruebas unitarias, más 18 de integración contra SQL Server |

Cuatro proyectos: `SISGAPO_API` (web), `Business`, `Data`, `Entity`, más `Test`. Los paquetes
sin uso de la versión original —`Microsoft.EntityFrameworkCore.SqlServer`,
`Microsoft.AspNet.WebApi.Cors`— se retiraron; ver `historico/hallazgos-2026.md`, D-09.

### Frontend — `sisgapo-web/`

| Componente | Versión | Notas |
|---|---|---|
| Angular | 14.3.0 | Desde octubre de 2026; era 9.1.2. Fuera de soporte, pero es el techo antes de Material MDC (D-51) |
| Angular Material + CDK | 14.2.7 | Mismos componentes y tema que en la 9 |
| Bootstrap | 5.0.2 | Solo *reboot* y *grid* |
| SweetAlert2 | 11.0.18 | Diálogos y alertas |
| TypeScript | 4.8.4 | — |
| TSLint | 6.1.3 | Deprecado en favor de ESLint; se ejecuta fuera del CLI |
| Karma + Jasmine | 4.4 / 3.5 | Doce `.spec.ts` de existencia. Protractor y `e2e/` se retiraron |

### Base de datos

SQL Server 2022: Express en un contenedor del VPS para la demo pública, y en Docker en local. **Casi toda
la lógica de negocio está en nueve stored procedures** (`03-modelo-de-datos.md`, sección 3).
El C# despacha llamadas y mapea `SqlDataReader` a DTOs; las únicas reglas que viven en C#
son la verificación de contraseñas y la validación de los datos de un usuario.

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

La infraestructura de hoy —un VPS propio, sin coste adicional— está en
`06-infraestructura.md`; cómo se llegó a ella, en `historico/migracion-contabo-2026-10.md`.

## 4. Estado inicial (agosto de 2026)

Cómo se encontró el proyecto al recuperarlo —infraestructura de Azure desaparecida,
compilación con doce avisos, secretos en la copia local, sin control de versiones— está
en [`historico/estado-inicial-2026-08.md`](historico/estado-inicial-2026-08.md). Es el
punto de partida de la auditoría; el estado actual está en `11-auditoria-y-cierre.md`.

## 5. Métricas del código

Medidas el 1 de octubre de 2026, sin `bin/`, `obj/` ni `node_modules/`. Las de agosto,
antes de los arreglos, están en el histórico.

### Backend — 4 811 líneas de C#

| Proyecto | Archivos | Líneas | Comentario |
|---|---|---|---|
| `Data` | 20 | 1 669 | Nueve clases, nueve interfaces, `Conexion` y `ConfiguracionBD` |
| `SISGAPO_API` | 13 | 1 291 | Siete controladores, `Startup`, `Program` y cuatro clases de `Seguridad` |
| `Test` | 7 | — | 27 pruebas unitarias y 18 de integración |
| `Business` | 10 | 547 | Nueve clases y `ParametroDelimitado`; `LoginBusiness` y `UsuarioBusiness` tienen lógica real |
| `Entity` | 11 | 390 | DTOs, con Data Annotations donde hace falta |

### Base de datos — 2 710 líneas de T-SQL en `sql/`

Doce scripts: esquema, función `Split`, seed y nueve procedimientos.

### Frontend — 3 984 líneas de TypeScript, más 761 de pruebas

- 19 componentes (7 listados, 6 modales, login, inicio, nav-menu, zona-form, estado-carga y app)
- 9 servicios (`login`, `panel`, `usuarios`, `almacenes`, `zona`, `inventario`,
  `configuracion`, `sesion`, `kardex-cronologia`), más el guard y el interceptor
- 8 archivos de modelos compartidos
- 13 scripts SQL originales de 2021, congelados como evidencia
- 12 archivos `.spec.ts`, todavía de existencia: comprueban que los métodos estén, no lo
  que hacen (`11-auditoria-y-cierre.md`, MC-10)

### Duplicación

Sigue siendo el rasgo más visible del backend, y es deliberado: los seis controladores
con `sOpcion` repiten el mismo esqueleto `if/else if/try/catch` y las nueve `Business` son
casi idénticas. Se evaluó un genérico y se descartó porque esconde el patrón `sOpcion`,
que es lo que hace predecible el código (`09-decisiones.md`, D-44). Lo que sí se limpió
—clases vacías, DTO duplicados, código muerto— está en `historico/hallazgos-2026.md`,
D-08 y D-09.

## 6. Valoración honesta para portafolio

**Lo que juega a favor, y seguía a favor desde el principio:**
- Alcance funcional cerrado: 12 casos de uso, todos con pantalla e implementación.
- Separación en capas real y disciplinada (API / Business / Data / Entity), con nombres consistentes.
- Convenciones aplicadas coherentemente en las tres capas (notación húngara, `TBL_*`, `USP_MNT_*`).
- Documentación de análisis previa al código (casos de uso versionados). Eso no abunda.
- SQL no trivial: joins multi-tabla, baja lógica, filtros dinámicos con `IIF`, una función de split.
- **Compila y corre hoy**, cinco años después. Eso no siempre pasa.

**Lo que jugaba en contra en agosto de 2026, y su estado actual:**
- Versiones fuera de soporte en las dos puntas (.NET 5, Angular 9) — ✅ el backend está en
  .NET 10 LTS (H-01, en `historico/auditoria-cierre-2026-10.md`); Angular subió a la 14 y se queda ahí
  para no cambiar Material (D-51).
- Autenticación decorativa y contraseñas en claro — ✅ corregido: bcrypt, JWT, `[Authorize]`
  y guards por rol (S-02 a S-04).
- Secretos en el repositorio — ✅ ninguno vigente; el que sí hubo (S-10) se retiró del historial.
- Sin inyección de dependencias — ✅ corregido: las nueve `Business` y las nueve `Data` están
  en el contenedor de ASP.NET Core y los controladores las reciben por constructor (D-03).
- Tests que no son tests — ✅ 27 pruebas unitarias y 18 de integración contra SQL Server,
  ejecutadas por GitHub Actions en cada push (C-10).
- Duplicación alta y código muerto (módulo `Cliente`, `WeatherForecast`, `Correo.cs` vacío) —
  ✅ limpiado; el módulo `Cliente` queda recuperable en el historial (D-19).
- Los scripts SQL no reconstruían la base de datos — ✅ `sql/` es reejecutable y
  `docker compose up` la deja lista (C-01).

**Conclusión.** Es un proyecto universitario de 2021 y se nota, pero es un proyecto
universitario *terminado*, con documentación y con el ciclo completo (análisis → BD → API →
frontend → despliegue → CI). Eso vale más que la mitad de los portafolios.

La estrategia que rinde más no es reescribirlo: es **presentarlo con fecha**, con las cuatro
cosas que un revisor mira primero ya resueltas (secretos, contraseñas hasheadas, autenticación
real, que se pueda levantar con un comando) y **documentar lo que harías distinto hoy**.
Esa última parte —el criterio— es lo que un cliente compra. Ver `07-plan-demo.md`.
