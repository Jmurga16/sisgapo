# 11 — Estado para portafolio

Estado verificado el 2 de septiembre de 2026, con los módulos de Lotes y Movimientos ya
dentro. Este documento separa lo terminado de lo que solo está propuesto, para que el
repositorio siga siendo comprensible aunque una mejora quede pendiente.

## Estado actual

| Área | Estado | Alcance |
|---|---|---|
| Demo funcional | Hecho | Login, panel, usuarios, zonas, almacenes, categorías, productos, lotes y movimientos ejecutados contra SQL Server |
| Seguridad | Hecho | BCrypt, JWT, autorización por rol, límite de login y validación del delimitador legado |
| Pruebas y CI | Hecho | 16 pruebas unitarias, 12 de integración contra SQL Server, cobertura y compilación de API y Angular en GitHub Actions |
| Entrega | Definido | GitHub Actions solo valida; el despliegue público es manual, sin CD |
| Capturas | Hecho | Login, panel e inventario reales en el README |
| Cuentas públicas | Hecho | `demo.supervisor` prueba escrituras y ajustes; `demo.asistente` consulta y registra entradas y salidas |
| Modo solo lectura | Hecho | `Demo__SoloLectura=true` bloquea escrituras en la API y deshabilita sus acciones en Angular |
| Contraseña inicial | Hecho | Mínimo de 8 caracteres validado en frontend y backend |
| Edición de usuarios | Hecho | La edición de datos personales ya no presenta el campo de contraseña |
| Formularios | Hecho | `outline` en formularios CRUD y filtros; el login conserva el estilo subrayado de su diseño |
| Ordenación de tablas | Hecho | `MatSortModule` está importado para los encabezados ordenables existentes |
| Lotes | Hecho | Varias partidas por producto, con fabricación, vencimiento y existencia propias |
| Movimientos y Kardex | Hecho | Entradas, salidas y ajustes con fecha, usuario, motivo y saldo; el Asistente opera y el Supervisor ajusta |
| Despliegue público | Pendiente | Crear infraestructura para la demo interactiva |
| Reinicio periódico de datos | Pendiente | Restaurar el seed de forma programada en la demo pública |
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
| Demo pública | Supervisor manipula datos operativos y ajusta; Asistente consulta y mueve inventario; el modo solo lectura queda disponible como respaldo |

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

## Orden recomendado

1. Desplegar la instancia pública y programar el reinicio periódico del seed.
2. Mantener `Demo__SoloLectura=true` como respaldo si se suspende el reinicio.
3. Llevar al panel la actividad reciente y las entradas y salidas del período:
   `USP_MNT_Movimientos` opción `04` ya devuelve esos totales (`09-mejoras-propuestas.md`, M-11).
4. Extender las pruebas de integración a los procedimientos de 2021 —Productos, Almacenes y
   Usuarios—, que son los que tuvieron los bugs históricos (M-08).
