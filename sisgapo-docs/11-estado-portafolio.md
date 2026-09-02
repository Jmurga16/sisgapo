# 11 — Estado para portafolio

Estado verificado el 2 de septiembre de 2026. Este documento separa lo terminado de lo
que solo está propuesto, para que el repositorio siga siendo comprensible aunque una mejora
quede pendiente.

## Estado actual

| Área | Estado | Alcance |
|---|---|---|
| Demo funcional | Hecho | Login, panel, usuarios, zonas, almacenes, categorías y productos ejecutados contra SQL Server |
| Seguridad | Hecho | BCrypt, JWT, autorización por rol, límite de login y validación del delimitador legado |
| Pruebas y CI | Hecho | 13 pruebas de backend, cobertura y compilación de API y Angular en GitHub Actions |
| Entrega | Definido | GitHub Actions solo valida; el despliegue público es manual, sin CD |
| Capturas | Hecho | Login, panel e inventario reales en el README |
| Cuentas públicas | Hecho | `demo.supervisor` prueba escrituras y `demo.asistente` comprueba el acceso de consulta |
| Modo solo lectura | Hecho | `Demo__SoloLectura=true` bloquea escrituras en la API y deshabilita sus acciones en Angular |
| Contraseña inicial | Hecho | Mínimo de 8 caracteres validado en frontend y backend |
| Edición de usuarios | Hecho | La edición de datos personales ya no presenta el campo de contraseña |
| Formularios | Hecho | `outline` en formularios CRUD y filtros; el login conserva el estilo subrayado de su diseño |
| Ordenación de tablas | Hecho | `MatSortModule` está importado para los encabezados ordenables existentes |
| Despliegue público | Pendiente | Crear infraestructura para la demo interactiva |
| Reinicio periódico de datos | Pendiente | Restaurar el seed de forma programada en la demo pública |
| Administrador público | Hecho | Tiene una clave separada y no se publica entre las credenciales de la demo |
| Validación de documentos | Hecho | DNI de 8 dígitos; Carné y Pasaporte de 6 a 15 caracteres alfanuméricos |
| Restablecimiento de contraseña | Fuera del alcance | La demo no tendrá cuentas reales |
| E2E | Fuera del alcance actual | Las reglas críticas quedan cubiertas por 13 pruebas unitarias y CI |
| Actualización de Angular | Fuera del alcance | Angular 9 compila en CI y no tendrá mantenimiento funcional continuado |

## Revisión del flujo

| Flujo | Resultado |
|---|---|
| Autenticación | Usuario activo entra; usuario inactivo o hash inválido se rechaza; el sexto intento por minuto recibe 429 |
| Autorización | Administrador gestiona usuarios; administrador y supervisor gestionan inventario; asistente consulta inventario |
| Usuarios | Alta con documento, teléfono, mayoría de edad y contraseña inicial; edición sin contraseña; baja lógica |
| Zonas y almacenes | Consulta, alta, edición y cambio de estado |
| Inventario | Filtros, categorías, productos, cantidades, precios, fechas y cambio de estado |
| Panel | Totales, valor del inventario, distribución y próximos vencimientos |
| Demo pública | Supervisor manipula datos operativos; Asistente consulta; el modo solo lectura queda disponible como respaldo |

## ¿Son suficientes los módulos?

Sí para una demo de portafolio: forman un recorrido coherente desde autenticación y
configuración del almacén hasta consulta del inventario y vencimientos. Añadir más CRUD no
mejoraría por sí solo la presentación.

El flujo actual es:

`login → panel → zonas → almacenes → categorías → producto/lote → stock y vencimiento`

Eso cubre configuración y catálogo, pero el stock sigue siendo una fotografía: al editar un
producto se reemplaza la cantidad y no queda registrado quién la cambió ni por qué.

Si el proyecto continúa, los dos módulos que completan el dominio son:

1. **Lotes:** permitir varios lotes del mismo producto por almacén, cada uno con fabricación,
   vencimiento y existencia propia.
2. **Movimientos y Kardex:** entradas, salidas y ajustes sobre un lote, con fecha, usuario,
   motivo y saldo. El Asistente registra operaciones normales y el Supervisor puede además
   realizar ajustes.

Con ambos, el recorrido pasa de mantener catálogos a explicar cómo cambia el inventario. Un
módulo de proveedores y compras sería la ampliación posterior, no el siguiente paso.

## Orden recomendado

1. Desplegar la instancia pública y programar el reinicio periódico del seed.
2. Mantener `Demo__SoloLectura=true` como respaldo si se suspende el reinicio.
3. Implementar el módulo de Lotes.
4. Implementar Movimientos y Kardex.
5. Añadir una prueba de integración SQL solo si esos módulos amplían los procedimientos.
