# 11 — Auditoría y cierre

Estado final de la demo. La auditoría con la que se cerró —la revisión del 1 de octubre de
2026 y los hallazgos corregidos el 2 y el 4 de octubre— está en
[`historico/auditoria-cierre-2026-10.md`](historico/auditoria-cierre-2026-10.md); la de
agosto–septiembre, en [`historico/hallazgos-2026.md`](historico/hallazgos-2026.md).

**Estado:** cerrado como demo de portafolio el 2 de octubre de 2026. Desde el 4 de octubre
corre en un VPS propio (`06-infraestructura.md`). **No queda ningún hallazgo abierto:** el 4
de octubre se corrigieron los cinco que tenían arreglo acotado —H-07 y H-12 a H-15— y cinco
mejoras de código (`09-decisiones.md`, D-53). Lo que sigue son dos limitaciones aceptadas y
seis mejoras que no se hacen mientras el proyecto siga cerrado, cada una con su motivo.

Los identificadores son los de la auditoría de cierre —`H-` hallazgos, `MC-` mejoras de
código, `R-` recomendaciones—, así que las citas de los demás documentos siguen valiendo.

## 1. Estado verificado el 4 de octubre de 2026

| Comprobación | Resultado |
|---|---|
| Backend | .NET 10, compila sin avisos. Análisis NuGet, incluido el transitivo, sin vulnerabilidades |
| Pruebas | 45 en verde contra el SQL Server de `docker compose` —27 unitarias y 18 de integración—, sin omitir ninguna. El CI ejecuta las mismas en cada push |
| Frontend | Angular 14 con Material 14; build de producción sin flags en Node 22 y 24 (D-51) |
| `npm audit --omit=dev` | 10 avisos, todos en los propios paquetes de Angular. Ver H-04 |
| Demo pública | `https://sisgapo.devkora.com` responde en menos de un segundo, sin arranque en frío, con certificado de Let's Encrypt |
| Datos de la demo | Se recargan desde el seed cada noche y en cada despliegue |
| Secretos | Ninguno versionado. Los del servidor viven en un `.env` que no sale de él |

## 2. Limitaciones aceptadas

#### H-04 · `npm audit` devuelve 10 avisos, todos en Angular

`sisgapo-web/package-lock.json`

Con Angular 9 eran 23, dos de ellos críticos, en herramientas de compilación que arrastraba
Webpack 4. La subida a Angular 14 (D-51) los bajó a 10 —4 altos y 6 moderados—, pero ahora
todos están en paquetes `@angular/*`, que sí llegan al navegador. Su corrección empieza en
Angular 20, más allá del techo que D-51 fija para no cambiar Material.

**Por qué se acepta:** es el coste de D-51. Cerrarlo es subir de una vez a la versión
vigente, y eso es rediseñar la interfaz. Si el proyecto se reabre para hacerlo, va junto con
MC-10.

#### H-16 · Las cantidades son enteras

`TBL_DET_PRODUCTO.nCantidad INT`, `TBL_MOVIMIENTO.nCantidad INT`, y `int` en las entidades

No se puede registrar una salida de 12,5 kg. El seed lo esquiva midiendo la vainilla en
gramos. Es una limitación del modelo de 2021 que los módulos nuevos heredaron a propósito
para no cambiar cuatro capas.

**Por qué se acepta:** es un cambio de modelo, no un arreglo —`DECIMAL(12,3)` en el
esquema, en los tres procedimientos que mueven cantidades, en `Entity`, en `Data` y en los
dos formularios—, y la demo se entiende igual con unidades enteras.

## 3. Mejoras de código que no se hacen

Ninguna es un defecto visible: son lo que anotaría un revisor que lea el código. MC-04 a
MC-07 y MC-11 se aplicaron el 4 de octubre; el detalle está en el histórico.

| # | Mejora | Por qué no, con el proyecto cerrado |
|---|---|---|
| MC-01 | **Un solo catálogo de opciones de escritura.** «Qué `sOpcion` escribe» está declarado en el chequeo de rol de cada controlador, en el `bEscritura` de cada `Business` y en `DemoSoloLecturaFilter` | Solo rinde cuando una entidad gana una opción, y cerrado no la gana ninguna. Cambia a la vez permisos, modo demo y sus pruebas |
| MC-02 | **Registrar cada excepción una vez.** `Data`, `Business`, el controlador y el middleware registran la misma excepción | Cambia la convención de `00-convenciones.md`, sección 8: es una decisión de reapertura, no de mantenimiento |
| MC-03 | **Configuración inyectada.** `ConfiguracionBD` y `ConfiguracionJwt` leen `appsettings` por su cuenta, y `Data` hace `new Conexion(1)` en nueve constructores | Refactor de nueve clases sin efecto visible; las pruebas de integración ya cubren la configuración real |
| MC-08 | **Hosting mínimo.** `Program.cs` + `Startup.cs` al modelo de `WebApplication.CreateBuilder` | Es D-05: opcional, y sigue sin aportar nada a la demo |
| MC-09 | **Un solo registro.** NLog y `Microsoft.Extensions.Logging` conviven sin integrarse | Va con MC-02: las dos cambian cómo se registra, y se hacen juntas o ninguna |
| MC-10 | **Frontend.** `.toPromise()`, `JSON.stringify` con `Content-Type` a mano en seis servicios, y once `.spec.ts` que no compilan y no están en el CI (`05-frontend.md`, sección 10) | RxJS está en la 6.5, que no tiene `firstValueFrom`: el cambio arrastra RxJS 7 y encaja con la subida de Angular que cerraría H-04 |

## 4. Recomendaciones vigentes

| # | Recomendación | Por qué |
|---|---|---|
| R-06 | Dejar lo que queda en este documento sin hacer mientras el proyecto siga cerrado | Son cambios de plataforma, de modelo o de convención: valen si se reabre el proyecto, no para mantener la demo |
| R-08 | No archivar el repositorio en GitHub mientras la demo esté en línea | Un repositorio archivado no ejecuta workflows ni admite cambios, y la demo seguirá necesitando un parche de vez en cuando |

Las demás recomendaciones de la auditoría de cierre están hechas o ya no aplican; su
detalle, en el histórico.
