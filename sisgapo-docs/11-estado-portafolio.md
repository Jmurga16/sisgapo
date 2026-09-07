# 11 — Estado para portafolio

Estado verificado el 6 de septiembre de 2026, con los módulos de Lotes y Movimientos, la
autenticación real y la demo pública ya dentro. Este documento junta dos preguntas: qué está
hecho frente a lo solo propuesto, y cómo se ve todo esto desde la perspectiva de alguien que
abre la demo por primera vez sin saber nada del proyecto.

## Estado actual

| Área | Estado | Alcance |
|---|---|---|
| Demo funcional | Hecho | Login, panel, usuarios, zonas, almacenes, categorías, productos, lotes y movimientos ejecutados contra SQL Server |
| Seguridad | Hecho | BCrypt, JWT, autorización por rol, límite de login y validación del delimitador legado |
| Pruebas y CI | Hecho | 16 pruebas unitarias, 12 de integración contra SQL Server, cobertura y compilación de API y Angular en GitHub Actions |
| Despliegue público | Hecho | Backend en Azure App Service, frontend en Azure Static Web Apps — enlace en el [README](../README.md) |
| Entrega | Definido | GitHub Actions solo valida; el despliegue público se hace a mano tras comprobar que CI está en verde, sin CD |
| Capturas | Hecho | Login, panel e inventario reales en el README, incluida vista móvil |
| Cuentas públicas | Hecho | `demo.supervisor` prueba escrituras y ajustes; `demo.asistente` consulta y registra entradas y salidas |
| Acceso de un clic | Hecho | Tres botones de rol en la pantalla de acceso, sin que el visitante busque una cuenta |
| Estado de carga y error en listados | Hecho | Componente `app-estado-carga` con reintento en los seis listados y en el login (C-21) |
| Cuentas históricas con `123456` | Hecho en el seed | Rehasheadas con clave fuerte no publicada; falta recargar la BD pública para que surta efecto |
| Reinicio periódico de datos | **Pendiente** | No hay ningún trabajo programado que recargue el seed; es la única pieza de infraestructura que falta |
| Administrador público | Hecho | Tiene una clave separada y no se publica entre las credenciales de la demo |
| Validación de documentos | Hecho | DNI de 8 dígitos; Carné y Pasaporte de 6 a 15 caracteres alfanuméricos |
| Restablecimiento de contraseña | Fuera del alcance | La demo no tendrá cuentas reales |
| E2E | Fuera del alcance actual | Las reglas críticas quedan cubiertas por 28 pruebas y CI |
| Actualización de Angular | Fuera del alcance | Angular 9 compila en CI y no tendrá mantenimiento funcional continuado |

## Revisión del flujo

| Flujo | Resultado |
|---|---|
| Autenticación | Usuario activo entra; usuario inactivo o hash inválido se rechaza; el sexto intento por minuto recibe 429 |
| Autorización | Administrador gestiona usuarios; administrador y supervisor gestionan catálogo y lotes y hacen ajustes; asistente consulta y registra entradas y salidas |
| Usuarios | Alta con documento, teléfono, mayoría de edad y contraseña inicial; edición sin contraseña; baja lógica |
| Zonas y almacenes | Consulta, alta, edición y cambio de estado |
| Inventario | Filtros, categorías, productos, cantidades, precios, fechas y cambio de estado |
| Lotes | Alta con código automático o manual, edición, baja lógica; se rechaza la baja de un lote con existencia y el código duplicado |
| Movimientos | Entrada, salida y ajuste sobre un lote; se rechaza la salida que deja el lote en negativo, el ajuste sin diferencia y el movimiento sin motivo |
| Kardex | Filtros por almacén, producto, lote, tipo y rango de fechas, con entradas, salidas, saldo y totales del período |
| Panel | Totales, valor del inventario, distribución y próximos vencimientos |
| Demo pública | Supervisor manipula datos operativos y ajusta; Asistente consulta y mueve inventario; verificado por HTTP contra la instancia real, sin credenciales |

## ¿Son suficientes los módulos?

Sí. El recorrido es completo y coherente:

`login → panel → zonas → almacenes → categorías → producto → lotes → movimientos y kardex`

Cubre configuración del almacén, catálogo, control de vencimientos por partida y —desde los
dos módulos nuevos— **cómo cambia el inventario y quién lo cambió**. Ese último tramo es el
que convierte la demo de una fotografía del stock en un flujo operativo, y el que da al rol
Asistente su primer caso de uso propio.

Lo que se resolvió con ellos:

1. **Lotes:** un producto puede tener varias partidas en el mismo almacén, cada una con su
   fabricación, su vencimiento y su existencia. Era el caso de uso central de un almacén de
   productos orgánicos y el modelo de 2021 no lo soportaba.
2. **Movimientos y Kardex:** la existencia deja de sobrescribirse. Cada cambio es una entrada,
   una salida o un ajuste, con fecha, usuario, motivo y saldo, y el listado de productos pasa
   a resumir sus lotes en vez de mostrar uno solo.

Un módulo de proveedores y compras sería la ampliación siguiente, no un requisito: el proceso
PN3 no está en el alcance de la demo (`09-mejoras-propuestas.md`, M-13).

## Veredicto desde la perspectiva de un visitante

**Se puede enseñar sin peros.** De los cinco puntos de primera impresión que se revisaron el
6 de septiembre —cuentas con `123456` activas, login sin señal de carga, README sin enlace a
la demo, listados sin aviso de error, e `index.html` en inglés— los cuatro que eran cambios de
código ya están aplicados y verificados. El detalle de cada uno está en `06-hallazgos.md`
(S-12, C-18, C-21) y en el README.

Lo que ya está bien y no hay que tocar:
- **La entrada sin credenciales está resuelta.** Tres botones —Administrador, Supervisor,
  Asistente— entran con un clic. Nadie queda trabado buscando un usuario.
- **Los datos de prueba son serios.** Café de altura, cacao fino de aroma, quinua de Puno,
  castañas de Madre de Dios, con descripciones creíbles y almacenes en ciudades reales del
  Perú. Un cliente del rubro se reconoce en ellos.
- **No hay basura de desarrollo.** Cero `console.log`, cero `TODO`/`FIXME` visibles, cero
  texto en inglés en la interfaz.
- **El README se entiende en 30 segundos:** qué es, el stack, capturas reales (incluido el
  móvil), enlace a la demo en vivo y cómo levantarlo. Con badge de CI en verde.

**Lo único que queda genuinamente pendiente:** el reinicio periódico del seed. Es la única
pieza de infraestructura, no de código, que separa la demo actual de una demo que se sostiene
sola sin vigilancia. Ver el punto siguiente.

### El reinicio periódico del seed, no el modo solo lectura

Para una demo de portafolio, las escrituras deben quedar **abiertas**: poder crear un producto
o registrar un movimiento es lo que la hace interesante. El riesgo no es que la gente escriba
—es para lo que está—, sino que sin reinicio los datos se degraden con el uso: alguien borra
medio catálogo y el siguiente visitante ve una demo vacía.

**Arreglo:** un trabajo programado que recargue `03-seed.sql` cada N horas. `Demo:SoloLectura`
sigue disponible como respaldo puntual para cuando el reinicio no esté activo, no como estado
por defecto (`06-hallazgos.md`, S-11).

## Qué es ruido para una demo — ignóralo sin culpa

Estos hallazgos de `06-hallazgos.md` son reales, pero **ningún visitante los va a percibir**.
Solo importan si alguien audita el código fuente línea por línea, y para eso ya está el
documento 06 explicándolos.

| Hallazgo | Por qué es ruido aquí |
|---|---|
| D-13 · Bundle sin *lazy loading* | Carga una vez; un visitante no lo nota. Solo lo ve un revisor de código |
| D-14 · Sin `OnPush` | Sin efecto perceptible a esta escala de datos |
| D-02 · Angular 9 | Compila y funciona; solo importa para "presumir stack moderno" |

Cerrarlos solo compensa **si un revisor técnico va a leer el código** — no son requisito para
*mostrar* la demo funcionando.

**Actualización del 6 de septiembre de 2026.** De esta lista salen cuatro, porque ya están
cerrados: D-06 y D-07 (los precios llevan céntimos y el teléfono es texto), D-10 (el backend
es asíncrono) y D-12 (la regla de rol vive en `PoliticaMovimiento`, con pruebas). Se
cerraron aceptando el criterio de esta sección, no contra él: **son ruido para el visitante,
pero no para el revisor**, y este proyecto se enseña para que lo lean.

**Actualización del 7 de septiembre de 2026.** Los tres que quedaban se cerraron sin
arreglarse, y esta sección es el motivo: son ruido de verdad. D-13 se probó y se midió —el
bundle principal creció, no bajó—, D-14 arriesga pantallas en blanco por un ahorro que a
esta escala nadie percibe, y D-02 (Angular 9) se queda como está porque migrar delataría que
el proyecto no es de 2021 y arrastraría a Material 3. Los tres están firmados como decisión
en `10-decisiones.md` (D-45, D-46 y D-47), que es distinto de dejarlos como pendientes.

## Orden recomendado

1. Programar el reinicio periódico del seed en la instancia pública. **Es lo único que
   queda.**
2. Dejar `Demo__SoloLectura` en `false` —como está hoy en el App Service— y ponerla en
   `true` solo si el reinicio se suspende y hay que proteger la demo a mano.
3. ~~Recargar la base pública para rotar las contraseñas históricas (S-12).~~ **Hecho el 7
   de septiembre de 2026**, verificado por HTTP: las siete cuentas rechazan `123456`.
4. Llevar al panel la actividad reciente y las entradas y salidas del período:
   `USP_MNT_Movimientos` opción `04` ya devuelve esos totales (`09-mejoras-propuestas.md`, M-11).
5. Extender las pruebas de integración a los procedimientos de 2021 —Productos, Almacenes y
   Usuarios—, que son los que tuvieron los bugs históricos (M-08).
