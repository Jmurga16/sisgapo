# 08 — Plan de demo

Cómo presentar SISGAPO a un cliente potencial sin que juegue en tu contra.

## 1. El planteamiento

Un proyecto universitario de 2021 tiene un problema y una ventaja, y las dos son la misma
cosa: **es de 2021**.

- Si lo presentas como trabajo actual, cada decisión anticuada parece falta de criterio.
- Si lo presentas **fechado**, cada decisión anticuada es contexto, y lo que enseñas ya no es
  el código: es tu criterio para evaluarlo cinco años después.

La segunda lectura es mucho más fuerte, y es la única honesta. Un cliente que contrata a un
desarrollador no compra código antiguo: compra criterio. **La capacidad de auditar un sistema
heredado, decir qué está mal y priorizar los arreglos es más vendible que un CRUD bonito** —
y además es exactamente el trabajo que suelen encargar.

Dicho de otro modo: la documentación de esta carpeta vale más como pieza de portafolio que la
aplicación en sí.

## 2. Qué enseñar

En orden de impacto:

| # | Elemento | Por qué funciona |
|---|---|---|
| 1 | **`06-hallazgos.md`** | 36 hallazgos priorizados de tu propio código, con lo corregido marcado y verificado. Demuestra criterio y honestidad, que es lo difícil de fingir |
| 2 | **`docker compose up`** funcionando | Un comando y el sistema entero arranca. Elimina toda fricción de la demo |
| 3 | La aplicación en vivo | Cinco módulos CRUD completos, con datos realistas |
| 4 | **`07-migracion-tier-free.md`** | Análisis de costos y decisiones de infraestructura. Lenguaje que un cliente entiende |
| 5 | El repositorio | Estructura por capas, convenciones consistentes, documentación |
| 6 | `/swagger` | La API documentada y navegable |

**El orden importa.** Si abres con la aplicación, el cliente ve un CRUD de 2021. Si abres con
el análisis, ve a alguien que sabe leer un sistema. Después la aplicación se ve mejor, porque
ya sabe que tú sabes dónde están sus costuras.

## 3. Guion de 10 minutos

**Minuto 0–1 · Encuadre**

> "Este es SISGAPO, un sistema de gestión de almacén que desarrollé en 2021 en la
> universidad. Lo he recuperado este año, lo he documentado y lo he migrado a
> infraestructura gratuita. Te voy a enseñar tres cosas: qué hace, qué encontré al auditarlo,
> y qué haría distinto hoy."

Fecharlo en la primera frase desactiva cualquier objeción sobre la antigüedad del stack.

**Minuto 1–4 · La aplicación**

Login → inicio → un recorrido corto:
- **Usuarios**: lista con paginación, filtros por nombre, rol y estado. Alta en modal.
- **Almacenes**: relación con zona y supervisor; baja lógica, no física.
- **Inventario → Productos**: la pantalla más completa, con seis tablas relacionadas.

Menciona la baja lógica de pasada: *"La especificación pedía borrado físico; decidí baja
lógica para conservar la trazabilidad."* Es una decisión de diseño defendida en una frase.

**Minuto 4–6 · La arquitectura**

Enseña el diagrama de `02-arquitectura.md` y di lo que realmente pasa:

> "Cuatro capas: API, negocio, datos y entidades. Pero la lógica real está en los stored
> procedures de SQL Server: la capa de negocio en C# es un pasamanos. Era el patrón habitual
> en el entorno donde aprendí. Hoy lo haría al revés."

Reconocer la limitación **antes** de que la vean es lo que convierte una debilidad en un
punto a favor.

**Minuto 6–9 · La auditoría**

Aquí es donde ganas la reunión. Abre `06-hallazgos.md`:

> "Al recuperarlo hice una revisión completa: 36 hallazgos, clasificados en seguridad,
> correctitud y deuda técnica, y priorizados. Los ocho bloqueantes son estos."

Elige **dos** y cuéntalos bien:

- **La edición de productos descarta la mitad de los cambios.** El frontend envía 10 parámetros y el procedimiento espera 11; dos de los cuatro `UPDATE` quedan con un `WHERE ... = NULL` y no afectan a ninguna fila. Y el sistema responde "actualizado con éxito". Lo reproduje contra SQL Server 2022. *(Es un buen ejemplo porque es sutil, real y lo demostraste.)*
- **Los scripts SQL no recreaban la base de datos.** Faltaba una columna que usaban cuatro procedimientos. Es decir: el proyecto no era reproducible. Lo corregí y lo verifiqué ejecutándolo.

**Minuto 9–10 · Costos**

> "Estaba desplegado en Azure por unos 78 dólares al mes, y el 94 % era un App Service Plan
> Standard sobredimensionado para una demo. Ahora corre en tier gratuito por cero, o en local
> con un solo comando de Docker."

Cerrar con costos es deliberado: es el único apartado que un cliente no técnico entiende
completo, y demuestra que piensas en su factura.

## 4. Preguntas que te van a hacer

**"¿Por qué Angular 9 / .NET 5?"**
> "Es la versión de 2021, cuando lo desarrollé. Verifiqué que el frontend sigue compilando en
> Node 22 con un flag de OpenSSL, así que actualizarlo no es urgente para la demo. El backend
> sí lo migré a .NET 8, porque .NET 5 ya no se puede desplegar en Azure."

**"¿Por qué toda la lógica en stored procedures?"**
> "Es el patrón con el que aprendí y el que usaba el entorno donde trabajaba. Tiene ventajas
> —el plan de ejecución está optimizado, se puede parchear sin desplegar— y una desventaja
> grande: la lógica no se puede testear ni versionar bien. Hoy la pondría en la capa de
> aplicación. En la documentación estimé lo que costaría moverla: entre cuatro y seis días."

Esta respuesta es fuerte porque no descalifica la decisión pasada, explica el contexto, y
demuestra que has calculado la alternativa.

**"¿Y las contraseñas en texto plano?"**
> "Es el hallazgo S-02 de mi propia auditoría, marcado como bloqueante. Está arreglado / está
> en la fase 4 del plan de migración."

Que el hallazgo ya esté en tu lista, escrito por ti, con prioridad asignada, es una respuesta
mucho mejor que cualquier justificación. **Nunca te pillen un problema que no estuviera ya en
tu documento.**

**"¿Esto lo hiciste solo?"**
Sé exacto. El documento de casos de uso lista un equipo de seis personas. Si el código lo
escribiste tú, dilo así:
> "Fue un proyecto de equipo de seis para el curso. El análisis y los casos de uso los
> hicimos entre varios; el desarrollo del backend y el frontend lo hice yo."

Una respuesta precisa siempre suena mejor que una absoluta, y no te expone si alguien
encuentra el documento con los seis nombres. Ver `10-decisiones.md` §D-09.

**"¿Puedo verlo funcionando?"**
Ten las dos vías listas: el enlace público **y** el `docker compose up` en tu portátil. Si el
enlace está frío, arranca Docker mientras se despierta y no pierdes el ritmo.

## 5. Antes de cada demo — lista de comprobación

**Una vez, la primera vez**
- [x] Repositorio público en GitHub, **sin secretos** — verificado también en el historial
- [x] `README.md` en la raíz, con el arranque en tres pasos
- [x] Los bugs visibles corregidos (§C-02, §C-03, §C-08, §C-12 a §C-18)
- [x] `docker compose up` probado desde cero
- [x] Base de datos poblada (5 zonas, 5 almacenes, 7 categorías, 25 productos)
- [ ] Captura de pantalla del panel en el README
- [ ] Recorrido completo en el navegador, con la consola abierta y en móvil

**Cinco minutos antes de cada reunión**
- [ ] Abrir el enlace público para despertar el App Service y la base de datos
- [ ] Comprobar que el login funciona
- [ ] `docker compose up -d` como plan B
- [ ] Tener `06-hallazgos.md` abierto en otra pestaña
- [ ] Si vas a crear registros durante la demo, hazlo una vez antes para verificar que no falla

## 6. El README del repositorio

Es lo primero que abre cualquiera, y ya está escrito: [`README.md`](../README.md) en la
raíz del monorepo. Tiene lo que hace falta —qué es, el arranque en tres pasos, las
credenciales de demostración y el índice de la documentación— y una advertencia explícita
de que la aplicación no se despliega en internet mientras la autenticación siga abierta.

Lo que le falta para la demo:

- **Una captura del panel de control.** Es lo que hace que alguien siga leyendo. Guárdala
  en `docs/` y enlázala desde el README.
- **El enlace a la demo en vivo**, cuando exista.

Y un párrafo que conviene no quitar nunca, porque es el que convierte un repositorio
antiguo en una muestra de trabajo actual:

> Al recuperarlo hice una auditoría completa: 36 hallazgos documentados y priorizados en
> `sisgapo-docs/06-hallazgos.md`, incluidos varios bugs funcionales que reproduje contra
> SQL Server 2022 antes de corregirlos. El registro de decisiones —qué elegí, qué descarté
> y por qué— está en `sisgapo-docs/10-decisiones.md`.

## 7. Lo que no conviene hacer

**No lo presentes como si fuera reciente.** Es verificable —el documento de casos de uso está
fechado en 2021, y las versiones del stack cantan— y te deja en mala posición.

**No pidas disculpas por él.** "Es viejo, no lo mires mucho" invita justamente a mirarlo mal.
Fecharlo no es disculparse: es dar contexto.

**No lo dejes público con la API abierta y contraseñas en claro** (§S-01 a §S-04). Si alguien
con criterio técnico lo revisa por su cuenta y encuentra eso sin que tú lo hayas mencionado,
el efecto es el contrario del que buscas.

**No enseñes la edición de productos sin haber arreglado §C-02.** Es la acción que un cliente
prueba, y falla en silencio.

**No inventes funcionalidad.** Si te preguntan por reportes o por gestión de proveedores, di
que estaban en el análisis (PN3) y no se llegaron a implementar. La respuesta correcta a "¿y
esto?" es "no está, y sé por qué".

## 8. Si tuvieras tiempo para una sola mejora

Ordenadas por lo que más cambian la percepción del proyecto:

| Mejora | Esfuerzo | Impacto |
|---|---|---|
| **`docker compose up` que funcione** | 3 h | ⭐⭐⭐⭐⭐ Elimina toda fricción; es lo primero que prueba un técnico |
| Autenticación JWT + contraseñas hasheadas | 6 h | ⭐⭐⭐⭐⭐ Quita la objeción más obvia |
| Corregir §C-02 y §C-03 | 2 h | ⭐⭐⭐⭐ Evita que falle justo cuando lo prueban |
| Actualizar el frontend a Angular moderno | 3–5 días | ⭐⭐⭐ Se nota, pero no es lo que más pesa |
| Mover la lógica de T-SQL a C# con tests | 4–6 días | ⭐⭐⭐⭐ Es la mejor pieza técnica, pero es un proyecto en sí |

**Si solo haces una: Docker Compose.** Que alguien clone el repositorio, escriba un comando y
tenga el sistema corriendo en dos minutos vale más que cualquier refactor que no vean.

## 9. La idea que sostiene todo esto

No estás vendiendo un sistema de gestión de almacén. Estás vendiendo:

- que **terminas** lo que empiezas (12 casos de uso, todos implementados);
- que **documentas** (análisis previo en 2021, auditoría completa en 2026);
- que **auditas con honestidad**, incluido tu propio trabajo;
- que **priorizas** (29 hallazgos ordenados por impacto, no una lista plana);
- que **piensas en el costo** (de US$ 78/mes a US$ 0, con el análisis de por qué);
- que **haces que otro pueda ejecutarlo** (un comando).

El código de 2021 es la excusa para demostrar las seis cosas. Ese es el producto.
