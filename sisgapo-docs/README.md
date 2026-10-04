# Documentación de SISGAPO

**SISGAPO** — Sistema de Gestión de Almacén de Productos Orgánicos.
Sistema web de inventario multi-almacén, desarrollado en 2021 (UNMSM, Ingeniería de
Sistemas), recuperado en 2026 y **cerrado como demo de portafolio el 2 de octubre de 2026**.

Estado: **funciona en local con un comando, y hay una demo pública en vivo** (enlace en el
[README de la raíz](../README.md)). Desde el 4 de octubre de 2026 corre en un VPS propio, en
contenedores, y la base de datos se reconstruye cada noche desde los scripts de `sql/`. No
queda ningún hallazgo abierto: lo que se podría hacer y no se hace, con su motivo, está en el
documento 08.

---

## Por dónde empezar

| Si vienes a… | Empieza por |
|---|---|
| Ponerlo a correr | el [README de la raíz](../README.md) |
| Escribir código | [`00-convenciones.md`](00-convenciones.md) |
| Entender el sistema | `01` → `02` → `03` |
| Usar la aplicación | [`10-manual-de-usuario.md`](10-manual-de-usuario.md) |
| Saber qué no se hizo y por qué | [`08-mejoras-posibles.md`](08-mejoras-posibles.md) |
| Presentarlo | [`07-plan-demo.md`](07-plan-demo.md) |
| Saber cómo se cerró | [`historico/auditoria-cierre-2026-10.md`](historico/auditoria-cierre-2026-10.md) |
| Moverlo a otro servidor | [`06-infraestructura.md`](06-infraestructura.md) y, como antecedente, [`historico/migracion-contabo-2026-10.md`](historico/migracion-contabo-2026-10.md) |
| Ver cómo se llegó hasta aquí | [`historico/`](historico/README.md) |

## Índice

| # | Documento | Contenido |
|---|---|---|
| 00 | [Convenciones](00-convenciones.md) | Notación, capas, el contrato `sOpcion`/`parametros`, reglas de datos y estilo |
| 01 | [Análisis general](01-analisis-general.md) | Contexto de negocio, alcance funcional, stack, métricas y valoración |
| 02 | [Arquitectura](02-arquitectura.md) | Capas y flujo completo de un request, tal como era en 2021, con la tabla de lo que cambió |
| 03 | [Modelo de datos](03-modelo-de-datos.md) | Tablas, relaciones, procedimientos y cómo recrear la base |
| 04 | [Referencia de API](04-api-referencia.md) | Endpoints, contratos y catálogo completo de códigos `sOpcion` |
| 05 | [Frontend](05-frontend.md) | Módulos Angular, rutas, servicios, componentes, sesión |
| 06 | [Infraestructura y costos](06-infraestructura.md) | De dónde venía el gasto, qué corre hoy y cómo redesplegar |
| 07 | [Plan de demo](07-plan-demo.md) | Cómo presentar el proyecto: guion y qué decir |
| 08 | [Mejoras posibles](08-mejoras-posibles.md) | Lo que se podría hacer y no se hace: el roadmap y las mejoras de código, con estimaciones y motivo |
| 09 | [Decisiones](09-decisiones.md) | Registro de decisiones tomadas, alternativas descartadas y su revisión al cierre |
| 10 | [Manual de usuario](10-manual-de-usuario.md) | Cómo se usa: acceso, permisos por rol y cada pantalla, con los mensajes que devuelve |

Los módulos de Lotes y Movimientos se documentan repartidos: modelo en el `03`, contratos en
el `04`, pantallas en el `05` y las decisiones que los sostienen en el `09` (D-26 a D-31).

También en esta carpeta:

- [`sql/`](sql/) — esquema, procedimientos y datos de demostración. Es la versión
  mantenida y verificada; los originales de 2021 siguen en `sisgapo-web/src/scripts/`
  como registro, y no se pueden ejecutar.
- [`historico/`](historico/README.md) — lo que ya no describe el proyecto de hoy: la
  auditoría de 2026 con sus 48 hallazgos cerrados, la auditoría de cierre, las mejoras que
  se aplicaron, el plan de la migración al VPS, el estado en que se encontró el proyecto y el
  documento de casos de uso de 2021. Los
  identificadores `S-`, `C-` y `D-` que citan los demás documentos apuntan a
  `historico/hallazgos-2026.md`.
- `capturas/` — las imágenes del README.

## El sistema en diez líneas

1. CRUD de inventario bien delimitado: usuarios, zonas, almacenes, categorías y
   productos, más lotes, movimientos con kardex y un panel de control con existencias y
   control de vencimientos.
2. Backend .NET 10 en cuatro proyectos por capas, frontend Angular 14, y **casi toda la
   lógica de negocio en nueve procedimientos almacenados de T-SQL**.
3. Doce casos de uso especificados en 2021, los doce con código y pantalla. Sobre eso, tres
   módulos añadidos en 2026 —panel, lotes y movimientos— que cierran el dominio: un producto
   puede tener varias partidas y la existencia deja de sobrescribirse.
4. `docker compose up -d` levanta SQL Server, crea la base y carga datos de demostración
   realistas. Los scripts son reejecutables.
5. Backend y frontend compilan hoy en Node 22 y 24 sin flags; el backend, además, sin
   avisos.
6. La auditoría de la recuperación encontró 48 hallazgos y **los 48 están cerrados**: 45
   arreglados y tres cerrados con el motivo escrito. La auditoría de cierre, hecha el 1 de
   octubre, encontró 16 más: 13 se corrigieron entre el 2 y el 4 de octubre y tres se
   cerraron por decisión, con el motivo escrito —Swagger solo en local, los avisos de
   `npm audit` como coste de quedarse en Angular 14 y las cantidades enteras—.
7. **La autenticación es real:** contraseñas con bcrypt, JWT firmado, `[Authorize]` en
   todos los controladores, guards por rol en Angular y límite de intentos de acceso.
8. No hay secretos en el repositorio. Sí los hubo: una contraseña de SonarQube estuvo en
   claro desde 2021 y se retiró reescribiendo el historial. La lección está escrita: la
   primera verificación buscaba cinco cadenas conocidas en vez del patrón de una credencial.
9. La infraestructura original costaba unos US$ 78 al mes, y el 94 % era un App Service
   Plan sobredimensionado. Desde el 4 de octubre de 2026 la demo corre en un VPS propio, en
   contenedores; el estado anterior queda en tags para volver a él sin reconstruirlo de
   memoria.
10. Lo que más valor aporta como pieza de portafolio no es el hosting: es la auditoría
    —la cerrada y la de cierre— y el registro de decisiones del documento 09.
