# 08 — Mejoras posibles

Lo que se podría hacer y no se hace: las mejoras más allá del alcance original de 2021 (`M-`)
y las mejoras de código que dejó la auditoría de cierre (`MC-`). Cada una lleva esfuerzo
estimado y una recomendación explícita de **hacerla o no hacerla**.

Todo lo de aquí es **opcional**. El alcance original está completo —12 de 12 casos de uso—
y encima hay tres módulos que no estaban en 2021. Lo que sí hay que hacer antes de archivar
el proyecto no era una mejora sino mantenimiento, y quedó hecho al cerrarlo (`historico/auditoria-cierre-2026-10.md`,
H-01 a H-03: el runtime y los paquetes).

## Cómo leer las recomendaciones

- ✅ **Hazlo** — el retorno justifica el esfuerzo para el objetivo de demo.
- 🤔 **Depende** — bueno, pero solo si te sobra tiempo o quieres un objetivo concreto.
- ❌ **No lo hagas** — no compensa para una demo; anotado por si el contexto cambia.

## Resumen

> **Estado al cierre, 4 de octubre de 2026.** Ocho de las catorce mejoras están aplicadas y
> verificadas: M-01 a M-05, M-09, M-11 y M-12. Qué se hizo en cada una y cómo se comprobó
> está en `historico/mejoras-aplicadas.md`; aquí se desarrollan las que no se aplicaron.

| # | Mejora | Esfuerzo | Demo | Portafolio | Reco. | Estado |
|---|---|---|---|---|---|---|
| M-01 | Contraseñas hasheadas | 2 h | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | **hecho** |
| M-02 | Autenticación JWT + guards | 6 h | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | **hecho** |
| M-03 | Reescribir `Conexion.cs` + DI | 3 h | ⭐⭐ | ⭐⭐⭐⭐ | ✅ | **hecho** (D-43) |
| M-04 | Corregir C-02 y C-03 | 2 h | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | **hecho** |
| M-05 | Limpiar código muerto | 30 min | ⭐ | ⭐⭐⭐ | ✅ | **hecho** |
| M-06 | Sustituir `pParametro` por JSON | 2 días | ⭐ | ⭐⭐⭐⭐ | 🤔 | mitigado |
| M-07 | Actualizar Angular | 3–5 días | ⭐⭐ | ⭐⭐⭐ | ❌ | **hasta la 14** (D-51); más allá, no se hace |
| M-08 | Pruebas reales | 2–3 días | ⭐ | ⭐⭐⭐⭐⭐ | 🤔 | **a medias:** unitarias e integración de los módulos nuevos |
| M-09 | Múltiples lotes por producto | 2 días | ⭐⭐⭐ | ⭐⭐⭐ | ✅ | **hecho** |
| M-10 | Lógica de T-SQL a C# | 6–8 días | ⭐⭐ | ⭐⭐⭐⭐⭐ | 🤔 | no se hace |
| M-11 | Reportes y panel | 3 días | ⭐⭐⭐⭐ | ⭐⭐⭐ | 🤔 | **hecho** |
| M-12 | Movimientos de inventario | 4 días | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | **hecho** |
| M-13 | Módulo de proveedores (PN3) | 5 días | ⭐⭐ | ⭐⭐ | ❌ | descartado |
| M-14 | Reescritura completa | 3–4 semanas | ⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ | descartado |

---

## 🤔 M-06 · Sustituir `pParametro` por JSON tipado

> **Mitigación aplicada.** El frontend ya envía un arreglo de valores y el backend rechaza
> `|` antes de reconstruir `pParametro`. Los procedimientos continúan usando `dbo.Split`,
> por lo que la sustitución completa descrita aquí no se hace.

**Resuelve de raíz:** `historico/hallazgos-2026.md`, S-07 · **Esfuerzo:** 2 días

Elimina el acoplamiento posicional, que es lo que queda del problema una vez cerrado el
delimitador.

```jsonc
// Hoy
{ "sOpcion": "05", "parametros": ["Almacén Norte", "Av. Perú 123", "2", "1"] }

// Después
POST /api/almacenes
{ "nombre": "Almacén Norte", "direccion": "Av. Perú 123", "idSupervisor": 2, "idZona": 1 }
```

**Por qué es tentador:** hace útil Swagger, permite validación con anotaciones de datos, y
da errores de compilación en vez de fallos en ejecución cuando cambia un campo.

**Por qué dudo:** hay que tocar simultáneamente el procedimiento, el `*Data.cs` y el
`*.service.ts` de cada entidad, y probar todos los casos de uso otra vez. Y el patrón actual,
aunque malo, **es consistente**, lo que lo hace predecible.

**Recomendación:** hazlo **solo si** también vas a hacer M-10 (llevar la lógica a C#). Los dos
juntos tienen sentido como un proyecto de modernización. Por separado, M-06 es mucho trabajo
para un beneficio que el cliente no ve.

**Si lo haces:** una entidad completa a la vez —procedimiento, C# y TypeScript— antes de
empezar la siguiente. `ZonaController` ya funciona así y sirve de plantilla.

## ❌ M-07 · Actualizar Angular

**Resolvía:** `historico/hallazgos-2026.md`, D-02 · **Esfuerzo:** hecho hasta la 14

El frontend subió de Angular 9 a la 14 en octubre de 2026 (`09-decisiones.md`, D-51) y **se
queda ahí**. La 14 es la última versión en la que Material conserva sus componentes
clásicos: de la 15 en adelante cambian los formularios, las tablas y los diálogos, y eso es
rediseñar la interfaz. Nada de este documento depende de subirlo.

El coste que queda a la vista son los 10 avisos de `npm audit`, todos en paquetes de Angular,
que solo se corrigen a partir de la 20. Está anotado y aceptado en D-51.

## 🤔 M-08 · Pruebas de verdad

**Resuelve:** `historico/hallazgos-2026.md`, C-10 · **Esfuerzo restante:** 2 días

Lo que hay: 27 pruebas unitarias —`LoginBusiness`, `UsuarioBusiness`, el filtro de modo demo
y la política de movimientos— y 18 de integración que ejecutan `USP_MNT_Lotes`,
`USP_MNT_Movimientos`, `USP_MNT_Usuarios` y `USP_MNT_Almacenes` contra SQL Server, incluido
el invariante «existencia = suma del kardex». CI corre las dos suites en cada push; las de integración se omiten solas si no hay
`SISGAPO_TEST_CONNECTION_STRING` (D-30).

**Lo que queda, por orden de retorno:**

1. **Integración de los procedimientos de 2021** —Productos, Categorías y Zonas, y lo que
   falta de Almacenes y Usuarios—, que son los que tuvieron los bugs históricos. El
   andamiaje (`BaseDeDatosPruebas`, `ProductoDePrueba`) ya existe; son casos, no
   infraestructura. De paso cubriría las reglas de D-35 y el hallazgo H-08 de la auditoría
   de cierre; H-12, H-14 y H-15 ya tienen las suyas en `MantenimientoIntegracionTests`.
2. **Los doce `.spec.ts` del frontend** comprueban que existan los métodos, no lo que hacen,
   y once ni compilan (MC-10). Lo que más rinde es probar los dos servicios con lógica: `SesionService`
   (caducidad) y `KardexCronologiaService` (agrupación por día).
3. **Un recorrido de extremo a extremo** con Playwright: login → listar → crear → mover →
   dar de baja. Uno solo, el de la demo.

## 🤔 M-10 · Mover la lógica de T-SQL a C#

**Esfuerzo:** 6–8 días

La transformación de fondo: sacar la lógica de negocio de los nueve procedimientos —unas
1 900 líneas de T-SQL, el doble que en agosto porque Lotes y Movimientos nacieron ahí— y
llevarla a servicios de C#, con Dapper o EF Core para el acceso a datos.

**A favor:**
- La lógica pasa a ser testeable, depurable y versionable de verdad.
- Desaparecen `dbo.Split` y el formato `|`, y con ellos M-06.
- Habilita M-08 por completo.
- **Deja de estar atado a SQL Server** — con la lógica en C#, cambiar a PostgreSQL o SQLite
  pasa a ser cuestión de horas.
- Es el cambio que mejor demuestra capacidad de modernizar sistemas heredados, que es
  trabajo muy solicitado.

**En contra:**
- Es más de una semana.
- El invariante del kardex, que hoy protege una transacción con `UPDLOCK` dentro de un
  procedimiento, hay que volver a garantizarlo en C#.
- El cliente ve exactamente lo mismo.

**Recomendación:** 🤔 la mejor pieza técnica del catálogo, pero es un proyecto en sí mismo.
**Si lo haces, hazlo en este orden:**
1. Pruebas de integración de todos los procedimientos actuales (M-08, punto 1): capturan el
   comportamiento correcto antes de moverlo.
2. Portar entidad por entidad, verificando contra esas pruebas.
3. Al terminar, valorar SQLite: la aplicación entera en un contenedor, sin servidor de base
   de datos.

Con la demo en el VPS (`historico/migracion-contabo-2026-10.md`) esta mejora pierde su argumento de
infraestructura —SQL Server deja de ser un problema de hosting— y se queda con el que
siempre fue el bueno: el de portafolio.

## ❌ M-13 · Módulo de proveedores (PN3)

**Esfuerzo:** 5 días

El proceso PN3 no forma parte de la demo actual. El módulo histórico `Cliente` llegó a tener
tabla, procedimiento, backend y pantalla, pero se dejó fuera del árbol publicado porque no
está integrado ni probado con el recorrido actual (`09-decisiones.md`, D-19).

**Recomendación:** ❌ para la demo actual. Mantenerlo en el historial evita añadir una entrada
de menú sin validar. Solo conviene restaurarlo si el objetivo cambia a cubrir abastecimiento
y se añaden datos, integración y pruebas.

## ❌ M-14 · Reescritura completa

**Esfuerzo:** 3–4 semanas

.NET actual con arquitectura vertical, Angular actual con señales, PostgreSQL, EF Core,
pruebas, CI/CD completo.

**Recomendación:** ❌ **y esta es la más importante de descartar.**

Si reescribes SISGAPO, dejas de tener SISGAPO: tienes un proyecto nuevo con nombre viejo. Y
pierdes justo lo que lo hace valioso como pieza de portafolio — que es **un sistema real de
2021, con sus decisiones de 2021, que tú sabes auditar en 2026**.

Si quieres un proyecto que demuestre stack moderno, construye uno nuevo desde cero y ten los
dos: *"aquí está lo que hice cuando empezaba, aquí está lo que hago ahora, y aquí está el
documento donde explico la diferencia"*. Esa pareja cuenta una historia mucho mejor que
cualquiera de los dos por separado.

---

## Ampliaciones pequeñas que quedaron anotadas

No llegan a mejora con número, pero salieron al hacer las otras:

- **El panel, con actividad.** Le faltan los movimientos recientes y las entradas y salidas
  del período; `USP_MNT_Movimientos` opción `04` ya devuelve esos totales, solo hay que
  traerlos a `inicio.component`. Medio día.
- **Exportar el kardex.** El listado tiene filtros y totales; un CSV de lo filtrado es lo que
  un cliente del rubro pediría a continuación. Dos horas, sin tocar la API.

## Mejoras de código que no se aplican

Salieron de la auditoría de cierre (`historico/auditoria-cierre-2026-10.md`, sección 4) y
conservan su identificador. MC-04 a MC-07 y MC-11 se aplicaron el 4 de octubre de 2026
(`09-decisiones.md`, D-53). Estas seis se evaluaron y se dejan: ninguna cambia lo que ve
quien usa o revisa la demo.

| # | Mejora | Esfuerzo | Por qué no se aplica |
|---|---|---|---|
| MC-01 | **Un solo catálogo de opciones de escritura.** «Qué `sOpcion` escribe» está declarado en el chequeo de rol de cada controlador, en el `bEscritura` de cada `Business` y en `DemoSoloLecturaFilter` | 2 h | Las tres listas coinciden y las pruebas del modo demo vigilan la del filtro. Unificarlas rinde cuando una entidad gana una opción, y con el proyecto cerrado no la gana ninguna |
| MC-02 | **Registrar cada excepción una vez.** `Data`, `Business`, el controlador y el middleware registran la misma excepción: cuatro entradas por fallo | 1 h | Cambia la convención de `00-convenciones.md`, sección 8, en las tres capas de las nueve entidades. Es el estilo de 2021 y se lee coherente |
| MC-03 | **Configuración inyectada.** `ConfiguracionBD` y `ConfiguracionJwt` leen `appsettings` por su cuenta, y `Data` hace `new Conexion(1)` en nueve constructores | 2 h | Refactor de nueve clases sin efecto visible; la configuración real ya la cubren las pruebas de integración |
| MC-08 | **Hosting mínimo.** `Program.cs` + `Startup.cs` al modelo de `WebApplication.CreateBuilder` | 2 h | Es D-05: `Startup.cs` sigue soportado en .NET 10 y cambiarlo no aporta nada a la demo |
| MC-09 | **Un solo registro.** NLog y `Microsoft.Extensions.Logging` conviven sin integrarse | 1 h | Va con MC-02: las dos cambian cómo se registra, y se harían juntas |
| MC-10 | **Frontend.** `.toPromise()`, `JSON.stringify` con `Content-Type` a mano en seis servicios, y once `.spec.ts` que no compilan y no están en el CI (`05-frontend.md`, sección 10) | 3–4 h | `.toPromise()` solo se sustituye con RxJS 7, y el frontend se queda en Angular 14 con sus dependencias (D-51). Lo demás es estilo |

## Rutas recomendadas

**Ruta mínima — 1 día.** M-04 → M-05 → migración a .NET 8. Demo local funcionando, sin bugs
visibles, US$ 0. *Hecha.*

**Ruta recomendada — 2,5 días.** La anterior + M-01 → M-02 → M-03 + despliegue. Demo pública
con autenticación real. *Hecha.*

**Ruta lúcida — +3 días.** La anterior + M-11 (panel) + M-09 (múltiples lotes) + M-12
(movimientos y kardex). Impresiona a clientes no técnicos y demuestra que entiendes el
dominio. *Hecha.* **Es donde está el proyecto, y donde se cierra.**

**Ruta técnica — +2 semanas.** M-08 completo → M-10 → SQLite. La mejor versión posible del
proyecto, y una historia de modernización completa. Es otro proyecto: solo tiene sentido si
el objetivo deja de ser «tener una demo» y pasa a ser «demostrar una modernización».

El objetivo era tener una demo, no un producto. Está.
