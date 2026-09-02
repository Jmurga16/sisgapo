# 11 — Estado para portafolio

Estado verificado el 2 de septiembre de 2026. Este documento separa lo terminado de lo
que solo está propuesto, para que el repositorio siga siendo comprensible aunque una mejora
quede pendiente.

## Estado actual

| Área | Estado | Alcance |
|---|---|---|
| Demo funcional | Hecho | Login, panel, usuarios, zonas, almacenes, categorías y productos ejecutados contra SQL Server |
| Seguridad | Hecho | BCrypt, JWT, autorización por rol, límite de login y validación del delimitador legado |
| Pruebas y CI | Hecho | 11 pruebas de backend, cobertura y compilación de API y Angular en GitHub Actions |
| Capturas | Hecho | Login, panel e inventario reales en el README |
| Modo demo | Hecho | `Demo__SoloLectura=true` bloquea escrituras en la API y deshabilita sus acciones en Angular |
| Contraseña inicial | Hecho | Mínimo de 8 caracteres validado en frontend y backend |
| Edición de usuarios | Hecho | La edición de datos personales ya no presenta el campo de contraseña |
| Formularios | Hecho | `outline` en formularios CRUD y filtros; el login conserva el estilo subrayado de su diseño |
| Ordenación de tablas | Hecho | `MatSortModule` está importado para los encabezados ordenables existentes |
| Despliegue público | Pendiente | Crear infraestructura y activar el modo de solo lectura en ese entorno |
| Reinicio periódico de datos | Pendiente opcional | Solo es necesario si una futura demo pública permite escrituras |
| Restablecimiento de contraseña | Pendiente | Debe ser un flujo independiente con autorización, no parte de editar datos personales |
| Pruebas de integración y E2E | Pendiente | Procedimientos SQL y recorrido login → alta → edición → baja |

## Revisión del flujo

| Flujo | Resultado |
|---|---|
| Autenticación | Usuario activo entra; usuario inactivo o hash inválido se rechaza; el sexto intento por minuto recibe 429 |
| Autorización | Administrador gestiona usuarios; administrador y supervisor gestionan inventario; asistente consulta inventario |
| Usuarios | Alta con documento, teléfono, mayoría de edad y contraseña inicial; edición sin contraseña; baja lógica |
| Zonas y almacenes | Consulta, alta, edición y cambio de estado |
| Inventario | Filtros, categorías, productos, cantidades, precios, fechas y cambio de estado |
| Panel | Totales, valor del inventario, distribución y próximos vencimientos |
| Demo pública | Lecturas disponibles; escrituras devuelven 403 y la interfaz oculta o deshabilita las acciones |

## ¿Son suficientes los módulos?

Sí para una demo de portafolio: forman un recorrido coherente desde autenticación y
configuración del almacén hasta consulta del inventario y vencimientos. Añadir más CRUD no
mejoraría por sí solo la presentación.

No son suficientes para venderlo como sistema operativo de almacén. Faltan movimientos de
entrada y salida, historial de existencias, múltiples lotes del mismo producto, compras o
proveedores, auditoría de cambios y recuperación de contraseña. Si el proyecto continúa,
la siguiente mejora funcional debería ser **movimientos de inventario con trazabilidad**;
después, múltiples lotes por producto.

## Orden recomendado

1. Desplegar una instancia pública con `Demo__SoloLectura=true`.
2. Añadir una prueba de integración de productos contra SQL Server.
3. Añadir un recorrido E2E de los flujos principales.
4. Implementar restablecimiento de contraseña solo si se necesitan cuentas no compartidas.
5. Añadir movimientos y múltiples lotes si el objetivo cambia de portafolio a producto.
6. Actualizar Angular únicamente si habrá mantenimiento continuado.
