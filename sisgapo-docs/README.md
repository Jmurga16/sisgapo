# Documentación de SISGAPO

**SISGAPO** — Sistema de Gestión de Almacén de Productos Orgánicos.
Sistema web de inventario multi-almacén desarrollado en 2021 (UNMSM, Ing. de Sistemas).

Estado actual: **código funcional, infraestructura desmantelada.**
Objetivo: **convertirlo en demo de portafolio con costo US$ 0/mes.**

---

## Por dónde empezar

**Si vienes a entender el sistema:** `01` → `02` → `03`.
**Si vienes a ponerlo a correr:** `07-migracion-tier-free.md`, sección "Ruta rápida".
**Si vienes a mostrarlo a un cliente:** `08-plan-demo.md`.
**Si quieres saber qué está mal:** `06-hallazgos.md`.

## Índice

| # | Documento | Contenido |
|---|---|---|
| 01 | [Análisis general](01-analisis-general.md) | Contexto de negocio, alcance funcional (12 casos de uso), stack, estado real, métricas del código |
| 02 | [Arquitectura](02-arquitectura.md) | Capas, flujo completo de un request, el patrón `sOpcion`/`pParametro`, diagramas |
| 03 | [Modelo de datos](03-modelo-de-datos.md) | 11 tablas, relaciones, los 6 stored procedures, y **cómo recrear la BD desde cero** |
| 04 | [Referencia de API](04-api-referencia.md) | 6 endpoints, contratos de request/response, catálogo completo de códigos `sOpcion` |
| 05 | [Frontend](05-frontend.md) | Módulos Angular, rutas, servicios, componentes, estado de la sesión |
| 06 | [Hallazgos](06-hallazgos.md) | 29 hallazgos clasificados: seguridad, correctitud, deuda técnica |
| 07 | [Migración a tier free](07-migracion-tier-free.md) | **Plan paso a paso para llegar a US$ 0/mes** |
| 08 | [Plan de demo](08-plan-demo.md) | Cómo presentar el proyecto: guion, checklist, qué decir y qué no |
| 09 | [Mejoras propuestas](09-mejoras-propuestas.md) | Roadmap más allá del alcance original, con estimaciones |
| 10 | [Decisiones](10-decisiones.md) | Registro de decisiones: qué dudé, qué elegí y por qué |

También en esta carpeta:
- `Documento de Especificación de CUS.docx` — documento original de casos de uso (2021).

## Resumen ejecutivo en 10 líneas

1. Es un CRUD de inventario bien delimitado: usuarios, zonas, almacenes, categorías y productos.
2. Backend .NET 5 en 4 proyectos por capas. Frontend Angular 9. Toda la lógica de negocio vive en 6 stored procedures de T-SQL.
3. **La infraestructura de Azure ya no existe:** ni el servidor SQL ni los App Services resuelven por DNS. No hay datos que migrar.
4. Por lo tanto no es una "migración" sino una **reconstrucción desde los scripts SQL** — y esos scripts están rotos (falta una columna, un SP usa `ALTER`, dos archivos duplican objetos).
5. El backend **compila hoy** sin errores. El frontend **compila hoy** con `NODE_OPTIONS=--openssl-legacy-provider`. Ambos verificados.
6. La autenticación es decorativa: contraseñas en texto plano, sin token, sin guards de ruta, sin `[Authorize]` en la API. Cualquiera puede llamar los endpoints.
7. Hay credenciales reales en el repositorio (cadena de conexión y una contraseña de Gmail en un comentario).
8. El costo original estimado era ~US$ 78/mes, dominado por un App Service Plan **S1 Standard** (~US$ 73). La base de datos era la parte barata (~US$ 5).
9. Se puede llegar a **US$ 0/mes**. La ruta recomendada y sus alternativas están en el documento 07.
10. Para portafolio, lo que más valor agrega no es el hosting sino: arreglar los scripts, sacar los secretos, hashear contraseñas y poner un `docker compose up` que funcione.
