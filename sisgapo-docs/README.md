# Documentación de SISGAPO

**SISGAPO** — Sistema de Gestión de Almacén de Productos Orgánicos.
Sistema web de inventario multi-almacén, desarrollado en 2021 (UNMSM, Ingeniería de
Sistemas) y recuperado en 2026.

Estado: **funciona en local con un comando.** La infraestructura original de Azure ya no
existe; la base de datos se reconstruye desde los scripts de `sql/`.

---

## Por dónde empezar

| Si vienes a… | Empieza por |
|---|---|
| Ponerlo a correr | el [README de la raíz](../README.md) |
| Escribir código | [`00-convenciones.md`](00-convenciones.md) |
| Entender el sistema | `01` → `02` → `03` |
| Saber qué está mal | [`06-hallazgos.md`](06-hallazgos.md) |
| Presentarlo | [`08-plan-demo.md`](08-plan-demo.md) |
| Ver qué está hecho y qué falta | [`11-estado-portafolio.md`](11-estado-portafolio.md) |

## Índice

| # | Documento | Contenido |
|---|---|---|
| 00 | [Convenciones](00-convenciones.md) | Notación, capas, el contrato `sOpcion`/`pParametro`, reglas de datos y estilo |
| 01 | [Análisis general](01-analisis-general.md) | Contexto de negocio, alcance funcional, stack, estado real, métricas |
| 02 | [Arquitectura](02-arquitectura.md) | Capas, flujo completo de un request, diagramas |
| 03 | [Modelo de datos](03-modelo-de-datos.md) | Tablas, relaciones, procedimientos y cómo recrear la base |
| 04 | [Referencia de API](04-api-referencia.md) | Endpoints, contratos y catálogo completo de códigos `sOpcion` |
| 05 | [Frontend](05-frontend.md) | Módulos Angular, rutas, servicios, componentes, sesión |
| 06 | [Hallazgos](06-hallazgos.md) | **La auditoría: 37 hallazgos de seguridad, correctitud y deuda técnica** |
| 07 | [Migración a tier free](07-migracion-tier-free.md) | Plan paso a paso para llegar a US$ 0/mes |
| 08 | [Plan de demo](08-plan-demo.md) | Cómo presentar el proyecto: guion y qué decir |
| 09 | [Mejoras propuestas](09-mejoras-propuestas.md) | Roadmap más allá del alcance original, con estimaciones |
| 10 | [Decisiones](10-decisiones.md) | Registro de decisiones tomadas y alternativas descartadas |
| 11 | [Estado para portafolio](11-estado-portafolio.md) | Qué está hecho, qué queda pendiente y suficiencia de módulos |

También en esta carpeta:

- [`sql/`](sql/) — esquema, procedimientos y datos de demostración. Es la versión
  mantenida y verificada; los originales de 2021 siguen en `sisgapo-web/src/scripts/`
  como registro, y no se pueden ejecutar.
- `Documento de Especificación de CUS.docx` — documento original de casos de uso (2021).

## El sistema en diez líneas

1. CRUD de inventario bien delimitado: usuarios, zonas, almacenes, categorías y
   productos, más un panel de control con existencias y control de vencimientos.
2. Backend .NET 8 en cuatro proyectos por capas, frontend Angular 9, y **toda la lógica
   de negocio en siete procedimientos almacenados de T-SQL**.
3. Doce casos de uso especificados en 2021, los doce con código y pantalla. El alcance
   está cerrado: no hay módulos a medias.
4. `docker compose up -d` levanta SQL Server, crea la base y carga datos de demostración
   realistas. Los scripts son reejecutables.
5. Backend y frontend compilan hoy. El frontend necesita
   `NODE_OPTIONS=--openssl-legacy-provider`, ya fijado en los scripts de `package.json`.
6. La auditoría encontró 37 hallazgos. Los bloqueantes de correctitud y los de
   autenticación están corregidos y verificados contra SQL Server.
7. **La autenticación ya es real:** contraseñas con bcrypt, JWT firmado, `[Authorize]` en
   todos los controladores y guards por rol en las rutas de Angular. Ver S-02 a S-04.
8. No hay secretos en el repositorio. Sí los hubo: la contraseña de SonarQube estuvo en
   claro desde 2021 y se retiró reescribiendo el historial (S-10). La verificación
   original de S-01 buscaba solo cinco cadenas conocidas y no la vio.
9. La infraestructura original costaba unos US$ 78/mes, y el 94 % era un App Service Plan
   S1 sobredimensionado. El plan para llegar a US$ 0 está en el documento 07.
10. Lo que más valor aporta como pieza de portafolio no es el hosting: es la auditoría del
    documento 06 y el registro de decisiones del documento 10.
