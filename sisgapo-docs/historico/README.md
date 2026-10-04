# Histórico

Lo que ya no describe el proyecto de hoy pero explica cómo llegó hasta aquí. Nada de esta
carpeta se mantiene: si algo contradice a los documentos de `sisgapo-docs/`, vale lo de
arriba.

| Archivo | Qué es | Vigencia |
|---|---|---|
| [`hallazgos-2026.md`](hallazgos-2026.md) | La auditoría de agosto–septiembre de 2026: 48 hallazgos de seguridad, correctitud y deuda técnica, con el estado final de cada uno. **Los 48 están cerrados.** Los identificadores `S-`, `C-` y `D-` que citan los demás documentos apuntan aquí | Cerrada el 7 de septiembre de 2026 |
| [`mejoras-aplicadas.md`](mejoras-aplicadas.md) | Las ocho mejoras del roadmap que se llegaron a hacer (M-01 a M-05, M-09, M-11 y M-12), con el detalle de qué se hizo. Las que no se hicieron están en `../08-mejoras-posibles.md` | Agosto–septiembre de 2026 |
| [`auditoria-cierre-2026-10.md`](auditoria-cierre-2026-10.md) | La auditoría con la que se cerró la demo: la revisión del 1 de octubre de 2026, los hallazgos `H-` corregidos el 2 y el 4 de octubre, las recomendaciones `R-` y la lista de cierre, toda marcada. Al final, el estado verificado al cerrar. Las mejoras que no se aplicaron están en `../08-mejoras-posibles.md` | Cerrada el 4 de octubre de 2026 |
| [`migracion-contabo-2026-10.md`](migracion-contabo-2026-10.md) | El plan para llevar la demo de Azure a un VPS propio —requisitos, contenedores, cron, endurecimiento y vuelta atrás— y, al principio, lo que cambió al ejecutarlo. Lo vigente está en `../06-infraestructura.md` y en `deploy/` | Ejecutada el 4 de octubre de 2026 |
| [`estado-inicial-2026-08.md`](estado-inicial-2026-08.md) | Cómo se encontró el proyecto al recuperarlo: infraestructura desaparecida, compilación con avisos, secretos en la copia local, sin control de versiones | Agosto de 2026, antes de cualquier arreglo |
| `Documento de Especificación de CUS.docx` | La especificación de casos de uso del curso, versión 4.0 de julio de 2021. Es el documento del que salen el alcance y los doce casos de uso de `../01-analisis-general.md` | 2021 |

Las referencias cruzadas dentro de estos archivos (`../03-modelo-de-datos.md`,
`../09-decisiones.md`, `../sql/`) apuntan a la carpeta superior. Los números de sección
que citan son los que tenían esos documentos en septiembre de 2026 y pueden haberse
movido.

El estado final de la demo está al final de [`auditoria-cierre-2026-10.md`](auditoria-cierre-2026-10.md), y lo que se podría hacer y no se hace, en [`../08-mejoras-posibles.md`](../08-mejoras-posibles.md).
