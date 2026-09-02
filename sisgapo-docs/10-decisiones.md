# 10 — Registro de decisiones

Documento pedido explícitamente: **dónde dudé, qué alternativas había, qué elegí y por qué.**

Cada entrada incluye lo que haría cambiar la decisión, para que puedas revisarla si tu
contexto no es el que supuse.

**Los supuestos de partida**, tomados de tu encargo:
1. El objetivo es una **demo de portafolio**, no un sistema en producción.
2. **Minimizar el gasto** es una restricción dura, no una preferencia.
3. Aspiras a **pocos cambios**, no a una reforma.
4. Tu tiempo es limitado y es el recurso caro.

Donde dos opciones estaban empatadas técnicamente, gana la que respeta estos cuatro puntos.

---

## D-01 · Motor de base de datos: conservar SQL Server

**La duda.** Pediste migrar la base de datos a un tier gratuito. La pregunta de fondo era si
aprovechar para cambiar de motor, ya que al no haber datos que migrar (el servidor de Azure ya
no existe) el cambio salía "gratis" en términos de datos.

**Opciones consideradas**

| Opción | Esfuerzo | Costo | Riesgo |
|---|---|---|---|
| **A. Azure SQL, oferta gratuita** | 2 h | US$ 0 | Los términos de la oferta pueden cambiar |
| **B. SQL Server en Docker (local)** | 1 h | US$ 0 | Ninguno, pero no da demo pública |
| C. PostgreSQL gratuito (Neon/Supabase) | 3–5 días | US$ 0 | Regresiones al reescribir 950 líneas de T-SQL |
| D. SQLite embebido | 4–6 días | US$ 0 | Reescritura completa de la lógica |

**Decisión: A + B en paralelo.** Azure SQL gratuito para el enlace público, SQL Server en
Docker para desarrollo y demos presenciales.

**Por qué.** El factor decisivo es que **toda la lógica de negocio está en T-SQL**, no en C#
(`02-arquitectura.md`, sección 1). Cambiar de motor no es cambiar una cadena de conexión: es portar
la aplicación. El inventario de construcciones no portables está en `03-modelo-de-datos.md`, sección 6
—`IIF`, `SCOPE_IDENTITY()`, variables de tipo tabla, `dbo.Split`, `CONVERT` con estilo
numérico— y además PostgreSQL plegaría a minúsculas los identificadores, rompiendo cada
`dr["nIdAlmacen"]` de la capa `Data`.

Las cuatro opciones cuestan US$ 0. C y D cuestan **entre 3 y 6 días de tu tiempo** para llegar
al mismo punto en dinero. Con "pocos cambios" y "no gastar" como restricciones, la respuesta
es conservar el T-SQL.

**Qué me hizo dudar.** La opción D (SQLite) es claramente superior en todo lo demás: sin
servidor de base de datos, sin arranque en frío, sin depender de la política de precios de
nadie, la aplicación entera en un contenedor. Y como pieza de portafolio es mucho mejor: "moví
la lógica de negocio de stored procedures a servicios de C# con pruebas" es una frase más
fuerte que "lo desplegué en el tier gratuito".

Si tu objetivo fuera demostrar capacidad de modernización en vez de tener algo que enseñar
pronto, mi recomendación sería D. Está desarrollada en `09-mejoras-propuestas.md`, M-10 con
el orden de ejecución seguro.

**Reconsidera si:** la oferta gratuita de Azure SQL deja de existir o cambia de condiciones;
el arranque en frío arruina una demo real; o decides invertir la semana de M-10.

---

## D-02 · Nube: seguir en Azure

**La duda.** Dijiste "otra bd, otra nube, etc." — la puerta estaba abierta a salir de Azure.

**Decisión: quedarse en Azure**, con App Service F1 (gratuito) + Azure SQL (oferta gratuita) +
Static Web Apps (gratuito).

**Por qué.** Es consecuencia directa de D-01: **fuera de Azure no existe SQL Server gratuito
gestionado.** Un contenedor de SQL Server necesita unos 2 GB de RAM, más de lo que ofrece
cualquier plan gratuito de Render, Fly.io o similares. Si conservas el T-SQL, Azure es la
única vía gratuita.

Se suma que ya tienes los workflows de Static Web Apps escritos y que conoces el despliegue.

**Qué me hizo dudar.** Cloudflare Pages es mejor que Static Web Apps para el frontend —más
rápido, sin arranque en frío, ancho de banda ilimitado— y es un cambio de 15 minutos. No lo
recomendé como principal solo porque lo que ya tienes también es gratis y funciona; queda
anotado en `07-migracion-tier-free.md`, sección 9.

**Reconsidera si:** tu suscripción de Azure da problemas, o si haces M-10 y quedas libre de
elegir motor. En ese caso: Cloudflare Pages + Fly.io + SQLite es la combinación más limpia.

---

## D-03 · Migrar a .NET 8, no a .NET 9

**La duda.** Si hay que salir de .NET 5 de todas formas, ¿por qué no la versión más reciente?

**Decisión: .NET 8.**

**Por qué.** .NET 8 es LTS con soporte hasta noviembre de 2026. Está disponible en todas las
plataformas de hosting, es la versión que más documentación y respuestas tiene, y es la que un
cliente reconoce como "actual y estable". Para un proyecto que quieres poder abrir dentro de un
año sin sorpresas, LTS es la elección correcta.

**Qué me hizo dudar.** .NET 9 se ve mejor en un currículum, y las diferencias de código para
esta aplicación son mínimas. Pero .NET 9 es STS (soporte corto): dentro de un año estarías
otra vez fuera de soporte y con la misma conversación pendiente.

**Reconsidera si:** el proyecto va a estar en mantenimiento activo. En ese caso ve a la LTS más
reciente disponible cuando lo hagas.

---

## D-04 · Conservar el patrón `sOpcion` / `pParametro`

**La duda.** Es el antipatrón más visible del sistema (`02-arquitectura.md`, sección 3): sin tipado,
acoplado por posición, con un delimitador que no se escapa. Es lo primero que criticaría un
revisor.

**Decisión: conservarlo.** Documentarlo a fondo, señalar sus problemas, y proponer el cambio
como mejora opcional (`09-mejoras-propuestas.md`, M-06).

**Por qué.** Tres razones:

1. **Es consistente.** Se aplica igual en las cuatro entidades principales. Un patrón malo aplicado con disciplina es más mantenible —y se lee mejor— que cuatro patrones distintos a medias.
2. **Cambiarlo son dos días** de tocar tres capas a la vez y volver a probar los 12 casos de uso, con riesgo alto de regresión.
3. **Está bien defendido en una entrevista.** "Es el patrón del entorno donde aprendí; tiene estos problemas concretos y así es como lo haría hoy" es una respuesta que suma. Aparentar que nunca lo usaste, no.

**Qué me hizo dudar.** El hallazgo S-07 (delimitador sin escapar) no es cosmético: un almacén
llamado `Norte|Sur` corrompe todos los parámetros siguientes. Estuve cerca de recomendarlo
como bloqueante.

Lo dejé en "importante" porque el arreglo mínimo —rechazar `|` en la validación— son 20
minutos y elimina el riesgo práctico sin tocar la arquitectura.

**Reconsidera si:** haces M-10. Con la lógica en C#, el formato delimitado deja de tener
sentido y ambos cambios se hacen juntos.

---

## D-05 · Conservar el patrón `Startup.cs`

**La duda.** .NET 8 usa hosting mínimo (`Program.cs` con `WebApplication.CreateBuilder`). El
patrón `Startup` sigue funcionando, pero se lee como código de .NET 5.

**Decisión: conservar `Startup.cs` en la migración.**

**Por qué.** Sigue estando soportado vía `webBuilder.UseStartup<Startup>()` y es el camino de
menor riesgo: separa un cambio de framework (que sí es obligatorio) de un cambio de estilo
(que no lo es). Si algo falla tras migrar a .NET 8, quieres que la causa sea evidente.

**Qué me hizo dudar.** Un revisor que abra `Program.cs` y vea `UseStartup<Startup>()` va a
pensar "esto es código viejo con el framework actualizado por encima". Y tiene razón. El
cambio son un par de horas.

**Recomendación práctica:** migra primero con `Startup`, verifica que todo funciona, y
entonces —en un commit aparte— pásalo a hosting mínimo. Así el cambio de estilo es reversible
sin tocar la migración. Anotado en `07-migracion-tier-free.md`, sección 5.4.

---

## D-06 · Corregir los scripts SQL en una carpeta nueva, sin tocar los originales

**La duda.** Los scripts de `sisgapo-web/src/scripts/` no ejecutan (`03-modelo-de-datos.md`,
sección 4). ¿Corregirlos donde están o crear una versión nueva?

**Decisión: crear `sisgapo-docs/sql/` con la versión corregida y dejar los originales intactos.**

**Por qué.**
- Los originales son **evidencia del estado de 2021**. Si los corrijo, se pierde la prueba de qué había mal — y esa prueba es parte del valor de la auditoría.
- Tu encargo era "análisis y documentación", no "arregla el código". Modificar fuentes en un encargo de documentación es pasarme de lo pedido.
- Los scripts corregidos son un **artefacto de la documentación**: son el bloqueante real para cualquier migración, así que dejarlos solo descritos en prosa habría sido entregar el análisis a medias.
- Está en una ubicación rara (`sisgapo-web/src/scripts/`, dentro del proyecto Angular). Moverlos a `sisgapo-docs/sql/` los deja donde se buscan.

**Qué corregí y qué no.** Corregí solo lo que impide **ejecutar** los scripts: la columna que
falta, `ALTER`→`CREATE`, duplicados, codificaciones, `USE`. **No corregí los bugs de lógica**
(C-02, C-05, C-06) porque son cambios de comportamiento que merecen decidirse aparte.
Quedan documentados y priorizados.

**Qué me hizo dudar.** Tener dos juegos de scripts puede confundir. Lo mitigué con
`sql/README.md`, encabezados explicativos en cada archivo, un aviso en
`sisgapo-web/src/scripts/README.md` y otro en `03-modelo-de-datos.md`.

**Reconsidera si:** decides que los originales no aportan. En ese caso, borra
`sisgapo-web/src/scripts/` y deja solo `sisgapo-docs/sql/`.

---

## D-07 · Ampliar los datos del seed

**La duda.** El seed original tenía 3 zonas, 2 usuarios, 2 almacenes y 5 productos. ¿Copiarlo
tal cual (fiel al original) o ampliarlo (mejor para demo)?

**Decisión: ampliarlo** a 5 zonas, 7 usuarios, 5 almacenes, 7 categorías y 25 productos.

**Por qué.** Es para una demo. Una tabla con dos filas hace que la paginación, los filtros y
la ordenación parezcan decorativos; con veinticinco, se ven trabajando. Incluí a propósito **un
usuario inactivo, un almacén inactivo y una categoría inactiva** para que el filtro por estado
—que existe y funciona— tenga algo que filtrar.

El catálogo reparte S/ 69 475 entre 21 productos activos sin que una sola línea domine el
panel. Las cinco unidades de medida quedan representadas con magnitudes coherentes; por
ejemplo, `Gramos` se reserva para vainilla y no para productos cuyo precio real es por kilo.
Los vencimientos son relativos a la fecha de carga, según D-16.

**Qué me hizo dudar.** Los datos originales son parte del registro histórico. Lo resolví
conservando su estructura, los nombres del seed original y su temática de café
orgánico: es el mismo seed, con más filas.

Cambié las URL de imágenes de zona: las originales apuntaban a blogs y sitios de terceros que
hoy pueden estar caídos o servir otra cosa. Ahora usan Unsplash. **Verifica que cargan antes
de una demo**, o descarga las imágenes al proyecto.

---

## D-08 · Recomendar Docker Compose como entregable prioritario

**La duda.** No estaba en el alcance del análisis. ¿Es pasarse?

**Decisión: recomendarlo con prioridad alta**, con los `Dockerfile` y el `docker-compose.yml`
escritos en `07-migracion-tier-free.md`, sección 8, pero **sin crearlos** en el repositorio.

**Por qué.** Es la respuesta directa a tu objetivo principal. Una demo tiene dos formas de
fallar: que no se pueda levantar, o que el enlace público esté frío justo cuando la enseñas.
`docker compose up` resuelve las dos. Y para un cliente técnico, que un repositorio arranque
con un comando dice más sobre tu forma de trabajar que el código que hay dentro.

**Por qué no los creé.** Requieren decisiones que dependen de la migración a .NET 8 (el
`Dockerfile` del backend depende del framework de destino), y crear archivos de
infraestructura funcionales excede "análisis y documentación". Están escritos y listos para
copiar.

---

## D-09 · Señalar la autoría en equipo

**La duda.** Escribiste "este sistema lo hice solo". El documento de casos de uso lista **seis
integrantes** y atribuye la redacción a dos de ellos.

**Decisión: mencionarlo, de forma neutral, en `01-analisis-general.md`, sección 1 y en
`08-plan-demo.md`, sección 4.**

**Por qué.** No es una contradicción: lo más probable es que el desarrollo lo hicieras tú y el
análisis fuera de equipo. Pero es un **riesgo concreto para el objetivo que me diste**: si vas
a enseñar el proyecto a clientes y alguien encuentra el documento con seis nombres, la
diferencia entre "lo hice solo" y "hice el desarrollo de un proyecto de equipo" pasa de ser un
matiz a ser un problema de credibilidad. Y la segunda frase no resta nada — desarrollar el
backend y el frontend completos de un proyecto de seis es igual de mérito.

Callármelo habría sido dejarte expuesto en el escenario para el que estoy escribiendo.

**No estoy afirmando nada sobre quién hizo qué.** Solo señalo que el documento existe, que
está en `sisgapo-docs/`, y que conviene tener la frase preparada.

---

## D-10 · Un solo documento de convenciones, en `sisgapo-docs/`

**La duda.** Las convenciones del proyecto —notación húngara, el contrato
`sOpcion`/`pParametro`, el recorrido por capas— no estaban escritas en ninguna parte: se
deducían leyendo el código. Con dos proyectos de stacks distintos, lo habitual sería un
documento por proyecto, o un `CONTRIBUTING.md` en la raíz.

**Decisión: uno solo, `00-convenciones.md`, dentro de `sisgapo-docs/`.**

**Por qué uno y no dos.** Las convenciones que de verdad importan son **transversales**.
La notación húngara cruza C#, TypeScript y T-SQL. El patrón `sOpcion`/`pParametro` solo se
entiende viendo las tres capas a la vez —y los cuatro bugs más graves del proyecto son
justamente capas que dejaron de estar de acuerdo entre sí—. Partir eso en dos archivos lo
rompería por donde no hay que romperlo.

Hay un detalle que lo confirma: **los scripts SQL del backend viven dentro del proyecto
Angular**. Un documento por proyecto no tendría dónde explicar eso.

**Por qué en `sisgapo-docs/` y no un `CONTRIBUTING.md` en la raíz.** Porque no son reglas
de contribución para terceros, sino descripción de cómo está construido el sistema, y eso
pertenece al mismo sitio que el resto del análisis. Lleva el número 00 porque es lo
primero que hay que leer antes de escribir código, por delante del análisis general.

**Reconsidera si:** el proyecto llega a tener colaboradores. Entonces sí hace falta un
`CONTRIBUTING.md` en la raíz, aunque solo sea para apuntar a este documento.

---

## D-11 · Numerar los documentos

**Decisión: prefijo numérico (`01-`…`10-`) en vez de nombres sueltos.**

**Por qué.** Impone un orden de lectura y hace que el listado del directorio sea el índice.
Para documentación que se lee de principio a fin la primera vez, el orden importa.

**Coste asumido:** insertar un documento en medio obliga a renumerar o a usar decimales.
Con diez documentos, es aceptable.

---

## D-12 · Un documento de auditoría separado, en vez de repartir los hallazgos

**La duda.** Los 29 hallazgos podrían haber ido cada uno en su documento temático (los de base
de datos en el 03, los de frontend en el 05…).

**Decisión: `06-hallazgos.md` centralizado**, con referencias cruzadas desde y hacia los
documentos temáticos.

**Por qué.** El documento de hallazgos es **la pieza con más valor para tu objetivo**
(`08-plan-demo.md`, sección 2). Una lista completa, priorizada y con un plan de ataque es algo que se
puede enseñar tal cual en una reunión. Repartida en seis documentos, deja de ser enseñable.

Además permite ver la distribución de un vistazo —8 bloqueantes, 13 importantes, 8 menores—,
que es justo lo que hace que se lea como una auditoría y no como una lista de quejas.

---

## D-13 · `sisgapo-docs/sql/` pasa a ser el juego mantenido

**La duda.** D-06 creó `sisgapo-docs/sql/` como una copia *mecánicamente* corregida —solo
lo justo para que ejecutase— y dejó explícito que "la lógica T-SQL no se tocó, incluidos
sus bugs". Al arreglar C-02, C-03, C-05 y C-07 había que tocar esa lógica. ¿Dónde?

**Decisión: corregir en `sisgapo-docs/sql/`, que a partir de ahora es el esquema
mantenido. `sisgapo-web/src/scripts/` queda congelado como evidencia de 2021.**

**Por qué.** La alternativa era una tercera copia, y tres juegos de scripts es peor que
dos en todos los sentidos. La historia se sigue contando igual de bien: los originales
enseñan qué había mal, `sql/` enseña cómo quedó. Los arreglos van marcados con `--[FIX]`
y una explicación de qué hacía antes, así que el diff es legible sin herramientas.

**Reconsidera si:** llegas a desplegar en Azure y quieres migraciones versionadas en vez
de scripts idempotentes.

---

## D-14 · Scripts reejecutables con `CREATE OR ALTER`

**La duda.** `docker compose up` dos veces fallaba: `02-funcion-split.sql` y los seis
`CREATE PROCEDURE` reventaban con "There is already an object named…". Solo el esquema
era reejecutable.

**Decisión: `CREATE OR ALTER PROCEDURE` en los procedimientos y un `DROP … IF EXISTS`
antes de la función.**

**Por qué.** Un entorno que solo se puede montar una vez no sirve para una demo: en
cuanto tocas un procedimiento quieres recargarlo sin borrar el contenedor. `CREATE OR
ALTER` existe desde SQL Server 2016 SP1 y Azure SQL lo admite, así que no cierra la
puerta al despliegue.

Ojo con el detalle que lo hacía fallar en silencio: el script de arranque iteraba sobre
`0*.sql`, que deja fuera cualquier archivo a partir del décimo. Ahora es `[0-9][0-9]-*.sql`.

---

## D-15 · La base se publica en el puerto 14330

**La duda.** El `docker-compose.yml` publicaba `1433:1433`, lo estándar. Contra esa
configuración, la API fallaba con "Error de inicio de sesión del usuario 'sa'" aunque
`sqlcmd` funcionase dentro del contenedor.

**Decisión: publicar en `14330`.**

**Por qué.** En la máquina de desarrollo hay **otra instancia de SQL Server** escuchando
en el 1433. Las dos pueden estar a la escucha, pero las conexiones a `localhost:1433` las
atiende la local, con otra contraseña de `sa`. Es un fallo que cuesta diagnosticar
—el mensaje apunta a credenciales, no a que estés hablando con otro servidor— y que le
va a pasar a cualquiera que clone el repositorio teniendo SQL Server instalado.

Publicar en un puerto no estándar cuesta una línea de documentación y elimina el problema
para todo el mundo.

---

## D-16 · Las fechas del seed son relativas, no fijas

**La duda.** D-07 fijó los vencimientos en 2026–2027 para que la demo no saliera con todo
caducado. Pero es una solución con fecha de caducidad, valga la redundancia: en unos meses
el mismo seed vuelve a mostrar el inventario entero vencido.

**Decisión: calcular las fechas con `DATEADD` sobre `GETDATE()` al cargar el seed.**

**Por qué.** El panel de inicio muestra "productos por vencer en 30 días". Con fechas
fijas, esa tarjeta enseña 0 hoy y un número alarmante dentro de un año. Con fechas
relativas, el escenario es siempre el mismo se cargue cuando se cargue:

- dos lotes activos vencen dentro de los próximos 30 días —alimentan la alerta sin que
  nada esté caducado;
- otros cuatro lotes vencen entre 31 y 90 días y el resto entre 6 y 18 meses;
- los cuatro lotes de productos dados de baja sí están vencidos, que es el motivo verosímil
  de la baja.

**Qué me hizo dudar.** Un seed con lógica es menos obvio de leer que una lista de fechas.
Lo compensa un comentario al principio del bloque explicando el escenario.

---

## D-17 · El panel de inicio, antes que la autenticación

**La duda.** `09-mejoras-propuestas.md` marca M-11 (panel) como 🤔 y M-02 (JWT) como ✅.
El orden natural sería autenticar primero.

**Decisión: construir el panel y dejar la autenticación para después.**

**Por qué.** `inicio.component.html` pesaba **0 bytes**: la primera pantalla después de
entrar estaba en blanco. En un recorrido de demo, eso es lo primero que ve el cliente, y
ninguna cantidad de rigor técnico compensa una pantalla vacía.

El panel además no toca el modelo —son cuatro consultas de agregación en un procedimiento
nuevo, `USP_MNT_Panel`— así que no compite con la autenticación ni la complica.

**Lo que esto cuesta:** la demo sigue siendo una API pública. Está asumido y anotado:
mientras S-02/S-03/S-04 sigan abiertos, **esto no se publica en internet**.

---

## D-18 · Monorepo con el historial de 2021 importado

**La duda.** El proyecto vivía en dos repositorios privados —`Jmurga16/SISGAPO.Back` y
`Jmurga16/SISGAPO.Front`, 21 y 36 commits entre junio de 2021 y enero de 2022— y en local
no había ningún `.git`. Había que elegir entre subir los cambios a cada repositorio por
separado o unificarlos.

**Decisión: un repositorio nuevo, `sisgapo`, público, con el historial de los dos
importado bajo `sisgapo-api/` y `sisgapo-web/`.**

**Por qué.** Tres cosas no cabían en la estructura de dos repositorios: `sisgapo-docs/`
—que es la pieza de más valor para el portafolio—, el `docker-compose.yml` que levanta el
sistema entero, y el `README` de arranque. Repartirlos habría significado tres enlaces y
un README que apunta a rutas de otro repositorio.

**Cómo se hizo, para que se pueda auditar.** No con `git subtree add`, que habría dejado
los commits antiguos apuntando a rutas de raíz, sino reescribiendo cada historial con
`git filter-branch --index-filter` para mover cada árbol bajo su carpeta, y uniendo
después las dos historias con `--allow-unrelated-histories`. El resultado:

- 57 commits originales conservados, con sus autores y fechas de 2021 intactas;
- `git log -- sisgapo-api/Data/Conexion.cs` y `git blame` funcionan con las rutas nuevas;
- un commit de unión que explica la operación, y encima el trabajo de 2026.

**Qué pasa con los repositorios viejos.** Se archivan, no se borran. Su historial ya está
íntegro dentro del monorepo.

**Qué se dejó fuera del árbol.** `dist/` del frontend (estaba versionado desde 2021; sigue
en el historial), `SISGAPO.7z` y los perfiles de publicación de Visual Studio, que
contienen el identificador de suscripción de Azure y una contraseña cifrada con DPAPI.

---

## D-19 · El módulo «Tracking» (Cliente) se queda fuera del árbol, no del historial

**La duda.** Al comparar la copia local con el repositorio apareció un sexto módulo
completo —tabla, procedimiento, tres capas de backend, pantalla Angular, ruta y entrada de
menú— que la copia local no tenía y que la auditoría había dado por código muerto
(C-11, ya rectificado). La limpieza de la fase 1 lo había eliminado partiendo de una
premisa falsa.

**Decisión: no restaurarlo en el árbol de trabajo por ahora. Queda íntegro en el
historial, y su recuperación es un comando.**

```bash
git checkout 72972df -- sisgapo-web/src/app/modulos/cliente sisgapo-web/src/scripts/TBL_CLIENTE.sql
git checkout 9d734a3 -- sisgapo-api/Data/ClienteData.cs sisgapo-api/Business/ClienteBusiness.cs
```

**Por qué.** El árbol que se publica es el que está **probado**: las fases 0 a 3 se
verificaron contra SQL Server y por HTTP sobre exactamente este código. Restaurar un
módulo que nunca se ha ejecutado en este entorno —cuyos scripts usan `USE [DB_SISGAPO]`,
sin datos de demostración y sin integración con el inventario— añadiría superficie sin
añadir calidad, y una entrada de menú rota es peor que una ausente.

**Qué me hizo dudar, y bastante.** Es el último trabajo del proyecto y el único que
apunta al proceso PN3 del documento de casos de uso. Borrarlo del árbol se acerca a borrar
parte de la historia. Lo que resuelve el dilema es que **el historial lo conserva**: no se
pierde nada, y la decisión es reversible en un minuto.

**Reconsidera si:** decides completarlo como sexto módulo de la demo. Es una tarde:
llevar los dos scripts a `sisgapo-docs/sql/`, quitarles el `USE`, pasar `nTelefono` a
`VARCHAR`, sembrar datos y volver a enganchar las pantallas.

---

## D-20 · Tipar las respuestas del frontend sin activar `strict` completo

**Decisión:** centralizar los contratos HTTP en `src/app/shared/models/`, hacer genéricos
los servicios y activar `noImplicitAny` junto con las comprobaciones estrictas que no
requieren modelar todavía todos los valores nulos.

**Por qué.** Cada `sOpcion` devuelve una forma distinta y el uso generalizado de `any`
ocultaba errores como confundir `nIdProducto` con `nIdCatProd`. Activar `strict` completo
de una vez habría convertido este arreglo acotado en una reescritura de los formularios y
los `@ViewChild`. `strictNullChecks`, `strictPropertyInitialization` y `strictTemplates`
quedan para una migración gradual.

La excepción de usuarios se mantiene explícita: sus escrituras devuelven `{ mensaje }`,
sin `cod`, mientras los demás módulos devuelven `{ cod, mensaje }`.

---

## D-21 · Estilos comunes para los listados

**Decisión:** compartir en `styles.css` la cabecera, la barra de filtros, el scroll de
tablas, la columna de acciones y el paginador responsive. Los CSS de componente conservan
solo reglas propias.

**Por qué.** Usuarios, almacenes, categorías y productos repetían las mismas reglas con
pequeñas diferencias y varios estilos en línea. Una sola implementación evita que una
pantalla quede sin el arreglo móvil aplicado a las demás. Se conserva el punto de ruptura
de Bootstrap (`768px`) porque las plantillas ya dependen de `row` y `col-md-*`.

---

## D-22 · La verificación se mueve del procedimiento a C#

**Decisión:** `USP_MNT_Login` deja de comparar la contraseña y pasa a devolver el hash
guardado; quien decide si las credenciales valen es `LoginBusiness`.

**Por qué.** No hay alternativa. Un hash bcrypt lleva sal, así que dos hashes de la misma
contraseña son distintos y `WHERE sContrasenia = @sContrasenia` no puede funcionar. El
efecto colateral es interesante: `Business` deja de ser un pasamanos y pasa a tener, por
primera vez, lógica de negocio real. El parámetro `@sContrasenia` desaparece de la firma,
y con él la costumbre de mandar la contraseña a la base de datos.

De paso se arregló algo que nadie había mirado: el procedimiento no filtraba por
`bEstado`, así que un usuario dado de baja seguía entrando. En el seed hay uno inactivo
(`jorge.salazar`) que hasta ahora iniciaba sesión sin problema.

---

## D-23 · El hasheo ocurre en `UsuarioBusiness`, no en el navegador

**Decisión:** el alta y la edición siguen enviando la contraseña dentro de `pParametro`;
`UsuarioBusiness` sustituye la posición 10 por su hash antes de llamar a la capa de datos.

**Por qué.** La alternativa era hashear en Angular, y eso no es seguridad: un hash
calculado en el cliente *es* la contraseña, solo que escrita de otra forma, y quien lo
intercepte entra igual. Hashear en el servidor obliga a partir y recomponer `pParametro`,
que es feo, pero el contrato se mantiene y la fealdad queda encerrada en un método.

Hay un efecto secundario que compensa: S-07 —el delimitador `|` sin escapar— dejaba de
ser teórico justo en este campo, porque una contraseña puede contener `|`. Al sustituirla
por el hash, que usa el alfabeto `./A-Za-z0-9`, el problema desaparece donde más dolía.

---

## D-24 · El token vive en `localStorage`

**Decisión:** guardar la sesión en `localStorage` bajo una única clave, gestionada solo
por `SesionService`.

**Por qué.** La alternativa correcta es una cookie `HttpOnly` con `SameSite`, que un XSS
no puede leer. Exige que la API y el frontend compartan dominio, y una demo repartida
entre dos servicios gratuitos no lo tiene. Es una concesión consciente, y en un sistema
con datos reales no sería aceptable.

Lo que sí cambia respecto a antes: la clave ya no es una credencial. Escribir
`localStorage` a mano deja de dar acceso, porque quien decide es la firma del token en el
servidor. El `localStorage` pasa de ser la autenticación a ser solo su transporte.

---

## D-25 · .NET 8 y autenticación en el mismo paso

**Decisión:** migrar de .NET 5 a .NET 8 y añadir la autenticación en la misma tanda, en
vez de dejar la migración para después.

**Por qué.** Petición explícita, y tiene sentido: `Microsoft.AspNetCore.Authentication.JwtBearer`
se elige por versión del framework. Hacerlo al revés obligaba a instalar la versión 5 del
paquete y volver a tocarla al migrar. La migración resultó ser mecánica —cinco
`TargetFramework`, seis versiones de paquete— y bajó los avisos de compilación de 18 a 0.

Se conserva `Startup.cs` en vez de pasar al modelo de `Program.cs` de nivel superior
(D-05): son dos cambios independientes y mezclarlos habría hecho ilegible el diff.

---

## Resumen de las decisiones

| # | Decisión | Nivel de duda |
|---|---|---|
| D-01 | Conservar SQL Server (Azure gratuito + Docker) | **Alto** — SQLite era mejor técnicamente |
| D-02 | Seguir en Azure | Bajo — es consecuencia de D-01 |
| D-03 | .NET 8 (LTS), no .NET 9 | Bajo |
| D-04 | Conservar `sOpcion`/`pParametro` | **Medio** — S-07 casi lo vuelve bloqueante |
| D-05 | Conservar `Startup.cs` | **Medio** — se lee como código viejo |
| D-06 | Scripts corregidos en carpeta nueva | Bajo |
| D-07 | Ampliar el seed | Bajo |
| D-08 | Priorizar Docker Compose sin crearlo | Bajo |
| D-09 | Señalar la autoría en equipo | **Medio** — callarlo perjudica más que decirlo |
| D-10 | Un solo documento de convenciones | Bajo |
| D-11 | Documentos numerados | Ninguno |
| D-12 | Auditoría centralizada | Bajo |
| D-13 | `sisgapo-docs/sql/` pasa a ser el juego mantenido | Bajo — revisa D-06, que queda matizada |
| D-14 | Scripts reejecutables con `CREATE OR ALTER` | Ninguno |
| D-15 | Publicar la base en el puerto 14330 | Ninguno |
| D-16 | Fechas del seed relativas a `GETDATE()` | Bajo |
| D-17 | El panel antes que la autenticación | **Medio** — invierte el orden de `09-mejoras-propuestas.md` |
| D-18 | Monorepo con el historial de 2021 importado | Bajo |
| D-19 | «Tracking» fuera del árbol, dentro del historial | **Medio** — revisa C-11 antes de opinar |
| D-20 | Tipar respuestas sin activar `strict` completo | Bajo |
| D-21 | Estilos comunes para los listados | Bajo |
| D-22 | Verificar la contraseña en C#, no en el procedimiento | Ninguno — bcrypt no deja alternativa |
| D-23 | Hashear en `UsuarioBusiness`, no en el navegador | Bajo |
| D-24 | El token en `localStorage` | **Medio** — una cookie `HttpOnly` sería lo correcto |
| D-25 | .NET 8 y autenticación en la misma tanda | Bajo |

**Las tres que más merecen tu revisión: D-01, D-04 y D-09.**
De las nuevas, la discutible es **D-24**: `localStorage` es la opción cómoda, no la
correcta. Con la autenticación ya cerrada, D-17 deja de ser una deuda.
