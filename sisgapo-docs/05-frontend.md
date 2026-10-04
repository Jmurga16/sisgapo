# 05 — Frontend

Aplicación Angular 14 de página única. Código en `sisgapo-web/src/`.

## 1. Cómo levantarlo

```bash
cd sisgapo-web
npm install
npx ng serve    # http://localhost:4200
npx ng build    # dist/SISGAPO-Front; la configuración por defecto es la de producción
```

Verificado en Node 22.23.1 y en Node 24.19: `npm ci` sin `--legacy-peer-deps`, el build de
producción en unos 20 s y `ng serve` sin `NODE_OPTIONS`.

Hasta octubre de 2026 el frontend estaba en Angular 9 y necesitaba tres rodeos: el flag
`--openssl-legacy-provider`, porque Webpack 4 calculaba hashes con MD4 y OpenSSL 3 ya no lo
ofrece; `--legacy-peer-deps`, porque `@ng-bootstrap` 6 declaraba Bootstrap 4; y el
`overrides` de `websocket-driver` para que `ng serve` arrancara en Node 24. Angular 14 trae
Webpack 5 y `webpack-dev-server` 4, y `@ng-bootstrap` se retiró porque no se usaba: ninguno
de los tres hace falta. Ver `09-decisiones.md`, D-51.

`npm run lint` llama a TSLint directamente: el builder `tslint` de Angular desapareció en la
versión 12. Señala unas 400 faltas de estilo que ya estaban en 2021; no forma parte del CI.

## 2. Estructura

```
src/app/
├── app.component.*            shell: solo <app-nav-menu>
├── app.module.ts              módulo único — no hay lazy loading
├── app-routing.module.ts      rutas protegidas por sesión y rol
├── login/                     componente + servicio de autenticación
├── inicio/                    página de bienvenida tras entrar
├── nav-menu/nav-menu/         barra lateral, control de sesión
├── shared/
│   ├── models/                contratos tipados de las respuestas HTTP
│   └── services/              sesión, guards, interceptor, configuración y fechas
└── modulos/
    ├── usuarios/              lista + modal + servicio
    ├── almacen/               lista + modal + servicio
    ├── zona/                  lista + formulario + servicio
    └── inventario/
        ├── categoria/         componente + modal
        ├── productos/         componente + modal
        ├── lotes/             componente + modal
        ├── movimientos/       componente + modal (kardex) + kardex-cronologia.service
        └── inventario.service.ts   (compartido por las cuatro pantallas)
```

**Un solo `NgModule`.** Los 18 componentes se declaran en `app.module.ts` y se cargan todos en
el bundle inicial: `main` pesa unos 966 kB. Para siete pantallas sigue siendo asumible, pero
dividir en módulos con carga diferida es la mejora obvia si el sistema creciera.

## 3. Rutas

| Ruta | Componente | Protegida |
|---|---|---|
| `''` | redirige a `login` | — |
| `login` | ninguno: el acceso lo pinta el menú del shell | no; con sesión lleva a `inicio` |
| `inicio` | `InicioComponent` | sesión |
| `usuarios` | `UsuariosListComponent` | administrador |
| `almacenes` | `AlmacenesListComponent` | administrador o supervisor |
| `zonas` | `ZonaListComponent` | administrador o supervisor |
| `zonas/agregar` | `ZonaFormComponent` | administrador |
| `zonas/editar/:id` | `ZonaFormComponent` | administrador |
| `categoria` | `CategoriaComponent` | sesión |
| `productos` | `ProductosComponent` | sesión |
| `lotes` | `LotesComponent` | sesión |
| `movimientos` | `MovimientosComponent` | sesión |

Las dos últimas aceptan un parámetro de consulta que preselecciona el filtro:
`lotes?producto=1` llega desde el botón «Lotes» del listado de productos, y
`movimientos?lote=1` desde el botón «Kardex» del listado de lotes. Es el recorrido natural
de la demo: catálogo → partidas → historia de una partida.

**La ruta `login` no tiene componente.** Lo que se ve lo decide `NavMenuComponent`, que vive
en el shell (`app.component.html`): sin sesión pinta `LoginComponent`; con sesión, la barra,
el menú y el `router-outlet`. Es un patrón poco habitual —el componente de navegación hace de
guardián y de contenedor a la vez— y explica por qué el árbol de rutas se ve raro a primera
vista. El menú vuelve a leer la sesión en cada navegación, porque también puede cerrarla el
interceptor ante un 401, y si hay sesión y la ruta es `/login`, lleva a `/inicio`. Hasta
octubre de 2026 la ruta apuntaba al propio `NavMenuComponent` y, con la sesión abierta,
pintaba la barra dentro de la barra (`11-auditoria-y-cierre.md`, H-11).

## 4. Sesión y control de acceso

`SesionService` guarda el token JWT, el rol, el nombre visible y la fecha de expiración en
una única entrada de `localStorage`. `AuthGuard` exige sesión y comprueba los roles declarados
en cada ruta. `TokenInterceptor` añade el encabezado `Authorization: Bearer` y cierra la
sesión únicamente cuando la API responde 401.

```typescript
const peticion = sToken
  ? req.clone({ setHeaders: { Authorization: `Bearer ${sToken}` } })
  : req;
```

El menú se filtra por rol. El administrador gestiona usuarios y el catálogo de zonas;
administrador y supervisor gestionan almacenes, catálogo y lotes; el asistente consulta el
inventario y **registra entradas y salidas**. El supervisor entra al listado de Zonas
—necesita saber en qué zona está su almacén— pero sin los botones de mantenimiento, y las
rutas de alta y edición le responden con el guardián. Ver `09-decisiones.md`, D-34. El ajuste —corregir la existencia sin documento que lo respalde— queda
para administrador y supervisor: `SesionService.fnPuedeAjustarInventario()` oculta la opción
y `InventarioController` la rechaza con 403 aunque llegue por otra vía. La API vuelve a
comprobar los permisos, por lo que ocultar botones no es la única barrera. En modo demo, la
interfaz deshabilita las escrituras y un filtro global de la API las rechaza con HTTP 403.

## 5. Servicios

Los servicios de negocio usan `HttpClient`; `ZonaService` conserva observables porque es el
único módulo REST y los demás mantienen `Promise` por compatibilidad con el código Angular 9.

| Servicio | Endpoint | Patrón |
|---|---|---|
| `LoginService` | `POST /LoginService` | objeto tipado |
| `PanelService` | `POST /Panel` | `sOpcion` + `parametros[]` |
| `UsuariosService` | `POST /UsuariosService` | `sOpcion` + `parametros[]` |
| `AlmacenesService` | `POST /AlmacenesService` | `sOpcion` + `parametros[]` |
| `InventarioService` | `POST /InventarioService/{Categoria,Producto,Lote,Movimiento}` | `sOpcion` + `parametros[]` |
| `ZonaService` | `GET/POST /api/zona` | REST, objeto tipado |
| `ConfiguracionService` | `GET /ConfiguracionService` | estado público del modo demo |
| `KardexCronologiaService` | — | cálculo de presentación, sin HTTP |

Los cuatro servicios del patrón `sOpcion` envían los valores separados:

```typescript
const params = { sOpcion, parametros: pParametro.map(String) };
return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
```

El backend valida el delimitador y reconstruye el string que consumen los procedimientos;
la función SQL `dbo.Split` sigue intacta.

Observaciones:

- **`.toPromise()` en todo.** Está deprecado desde RxJS 7 y eliminado en RxJS 8; los componentes usan `async/await` en lugar de suscripciones. Funciona, pero desaprovecha la cancelación automática y los operadores de RxJS. `ZonaService` es el único que devuelve observables y usa `.subscribe()`.
- **`JSON.stringify` manual.** `HttpClient` ya serializa el cuerpo; hacerlo a mano y además fijar `Content-Type` es redundante.
- **Interceptor HTTP.** Centraliza el token y el cierre de sesiones vencidas; los mensajes
  específicos y un indicador global de carga todavía pueden mejorarse.
- **Respuestas tipadas.** Los contratos de cada opción viven en `shared/models/` y los
  servicios son genéricos. Los parámetros viajan como arreglo, aunque los procedimientos
  todavía conservan el contrato posicional delimitado.

## 6. Componentes

Todos los módulos siguen el mismo patrón: **lista + modal**.

**Componente de lista** — carga los datos en `ngOnInit`, los mete en un `MatTableDataSource`
con `MatPaginator` y `MatSort`, y abre un `MatDialog` para crear o editar. Confirma las bajas
con SweetAlert2 y recarga la tabla al cerrarse el modal.

**Componente modal** — recibe `{ accion, nId }` por `MAT_DIALOG_DATA` (`accion === 0` es alta,
distinto de 0 es edición), carga los catálogos para los selectores, y en edición pide los
datos por id. Al guardar, elige el código de operación con un ternario:

```typescript
let pOpcion = this.data.accion == 0 ? '05' : '06';   // 05 alta / 06 edición
```

`MovimientosModalComponent` es el otro que se sale del patrón: no tiene modo edición porque
un movimiento no se edita ni se borra —se corrige con otro movimiento—, así que recibe el
lote preseleccionado en vez de `{ accion, nId }`. El formulario adelanta la existencia
resultante del lote con las mismas reglas que aplica `USP_MNT_Movimientos`, incluidas las dos
que el procedimiento rechaza: una salida mayor que el saldo y un ajuste que coincide con la
existencia.

`MovimientosComponent` presenta el mismo kardex de dos formas, que se eligen con un
selector: la **lista** —tabla paginada y ordenable, con el detalle completo— y la
**cronología** —los movimientos agrupados por día, con el total de entradas y salidas de cada
jornada y el saldo que dejó cada operación—. El botón «Kardex» del listado de Lotes abre
directamente la cronología del lote. Ver `09-decisiones.md`, D-33.

La cronología no pagina como la tabla: muestra los diez días más recientes y crece de diez en
diez con «Mostrar más días», con un pie que dice cuántos movimientos y cuántos días quedan
por ver. El corte va por días completos porque partir una jornada rompe la agrupación, que es
lo único que aporta la vista. Ver `09-decisiones.md`, D-36.

El cálculo de esa agrupación no vive en el componente: está en
`movimientos/kardex-cronologia.service.ts`, junto con las etiquetas de día («Hoy ·»,
«Ayer ·», y el nombre del día en castellano) y las interfaces `DiaKardex` y
`MovimientoKardex`. El componente solo pide la lista agrupada y reinicia el contador de
tandas. Es un service y no un pipe porque el resultado depende de la fecha de hoy, y un pipe
puro con esa entrada mentiría sobre su pureza (`historico/hallazgos-2026.md`, D-15).

Los dos selectores que elegían entre listas largas son ahora **autocompletados**: el producto
en el alta de un lote —se busca por nombre de producto o de almacén— y el lote en el alta de
un movimiento —por código de lote, producto o almacén—. El control guarda el objeto elegido y
no el id, así que un texto escrito a mano que no corresponda a ninguna opción deja el
formulario inválido en vez de enviar un id vacío. Las opciones se pintan en dos líneas: arriba
lo que se escribe para buscar, debajo lo que distingue una coincidencia de otra.

`ZonaFormComponent` rompe el patrón: es una página completa en vez de un modal. Hasta
2026 tenía además un defecto grave —su modo edición no editaba, siempre insertaba—,
documentado en `historico/hallazgos-2026.md`, C-03 y ya corregido: ahora llama a `updateZona()` cuando
la ruta trae `:id`, y el módulo tiene actualización y baja lógica en las tres capas.

La validación de imagen llama ahora a `fnValidarImagen()`, acepta las URL sin extensión de
Unsplash y admite `.png`, `.jpg`, `.jpeg` y `.webp` aunque haya parámetros de consulta.

## 7. Interfaz y estilos

- **Angular Material 14** como base: `MatTable`, `MatDialog`, `MatSidenav`, `MatPaginator`, `MatDatepicker`, `MatSelect`, `MatAutocomplete`.
- **Bootstrap 5.0.2**, del que solo se cargan *reboot* y *grid*: la aplicacion usa
  unicamente `row`, `col-md-*` y `justify-content-center`. Cargar el framework completo
  costaba 96 KB de CSS bloqueante sin usarlos.
- **SweetAlert2** para confirmaciones y avisos.

Dos sistemas de estilos conviviendo, desde que `@ng-bootstrap` y `@ng-select` —importados
pero sin uso en ninguna plantilla— salieron con la subida a Angular 14. Funciona, pero
produce inconsistencias visuales —espaciados de Material junto a la rejilla de Bootstrap— y
hace que el CSS global sea más difícil de mantener. Las listas comparten ahora cabecera, filtros,
scroll horizontal, acciones y paginador responsive en `styles.css`; los estilos propios
quedan en cada componente.

Los **cinco modales** comparten esqueleto: cabecera `clstitulo`, cuerpo en
`mat-dialog-content.contenido-formulario` —que le da scroll propio y deja fijos el título y
la botonera— y `mat-dialog-actions.acciones-formulario`. Esos estilos viven una sola vez en
`styles.css`. Antes estaban repetidos en el CSS de tres componentes y, como Angular encapsula
los estilos de componente, los dos módulos nuevos —Lotes y Movimientos— se quedaron sin
ellos: el título salía sin barra azul y los campos con el ancho por defecto de Material, que
es lo que descuadraba sus columnas. Ver `09-decisiones.md`, D-32.

El **encabezado de página** es también uno solo, `header-app`: título a la izquierda, con el
mismo texto que la etiqueta del menú, y sin subtítulo salvo en el panel de inicio. Antes
convivían tres variantes —centrado, alineado a la izquierda con subtítulo descriptivo, y
«Gestión de X»—, que era lo primero que se notaba al pasar de una pantalla a otra.

La **pantalla de acceso** tiene tres pastillas, una por rol, que entran directamente, y un
enlace que abre el detalle de las cuentas —usuario, alcance y la contraseña común— en un
diálogo. Sin eso, el enlace público terminaba en un formulario vacío. Al apilarse, el panel
de marca pasa a ser una banda azul con el texto en blanco: las ondas decorativas cruzaban el
lema. Ver `09-decisiones.md`, D-37.

En **pantalla estrecha los listados no se muestran como tabla**. Por debajo de 768 px la
clase `tabla-tarjetas` oculta la cabecera y convierte cada fila en una tarjeta cuyas celdas
llevan su rótulo en `data-label`; el filtro, el paginador y el modo consulta siguen siendo los
mismos. Movimientos no se convierte: en ese ancho arranca en la vista de cronología. Ver
`09-decisiones.md`, D-38.

`AppDateAdapter` (`shared/services/AppDateAdapter.ts`) adapta el formato de fecha de Material
al formato que espera el backend.

## 8. Configuración de entorno

```typescript
// environment.ts
{ production: false, API_URL_INV: "https://localhost:44360/" }

// environment.prod.ts
{ production: true,  API_URL_INV: "/api/" }
```

En producción la API es una ruta relativa: la web y la API comparten origen, y el Caddy de la
web reenvía `/api/*` a la API (`09-decisiones.md`, D-52). Los builds de Azure y de Hostinger
apuntaban al App Service por HTTPS (`historico/hallazgos-2026.md`, S-08); siguen en los tags
`demo-azure` y `demo-azure-hostinger`.

## 9. Despliegue

El repositorio conserva un único workflow, `.github/workflows/ci.yml`, con tres trabajos:
compilación y pruebas del backend, pruebas de integración contra un SQL Server levantado con
`docker compose`, y build de producción del frontend con Node 22 y el lockfile, en cada push
y pull request. De los workflows de Azure Static Web Apps de 2021 queda uno en
`sisgapo-web/.github/workflows/`, que no se ejecuta: GitHub solo lee los de la raíz del
repositorio, y el recurso al que apuntaba ya no existe (`11-auditoria-y-cierre.md`, MC-05). El despliegue público es manual: `bash deploy/deploy.sh`,
con el CI en verde; no sale de este workflow.
Ver `06-infraestructura.md` y `11-auditoria-y-cierre.md`.

## 10. Resumen de problemas del frontend

| # | Problema | Gravedad | Dónde | Estado |
|---|---|---|---|---|
| 1 | Ninguna ruta protegida | 🔴 | `app-routing.module.ts` | corregido |
| 2 | Editar zona crea un duplicado | 🔴 | `zona-form.component.ts` | corregido |
| 3 | Editar producto envía 10 parámetros de 11 | 🔴 | `productos-modal.component.ts` | corregido |
| 4 | Sesión = un número en `localStorage` | 🔴 | `login.component.ts` | corregido — JWT con expiración |
| 5 | El formulario de acceso no responde al clic con la ventana baja | 🔴 | `login.component.css` | corregido |
| 6 | El rol no filtra menús ni acciones | 🟠 | `nav-menu.component.ts` | corregido |
| 7 | `if (!this.fnValidarImagen)` sin `()` | 🟠 | `zona-form.component.ts` | corregido |
| 8 | Sin diseño para móvil en la pantalla de acceso | 🟠 | `login.component.css` | corregido |
| 9 | Los filtros de Productos no filtraban | 🟠 | `productos.component.ts` | corregido |
| 10 | Sin interceptor HTTP y con manejo de errores desigual | 🟠 | servicios y componentes | mitigado — interceptor y errores de escritura visibles |
| 11 | Workflow con `output_location` incorrecto | 🟠 | `.github/workflows/` | corregido |
| 12 | URL cableada en `InicioComponent` | 🟡 | `inicio.component.ts` | corregido |
| 13 | Errores silenciosos al iniciar sesión | 🟡 | `login.component.ts` | corregido |
| 14 | `.toPromise()` deprecado | 🟡 | cinco servicios | pendiente |
| 15 | 8 `.spec.ts` sin adaptar | 🟡 | todo el proyecto | pendiente |
| 16 | Un solo módulo, sin carga diferida | 🟡 | `app.module.ts` | descartado — se midió y el bundle creció (D-45) |
| 17 | Tres sistemas de estilos conviviendo | 🟡 | `styles.css` | mitigado — Bootstrap reducido a grid |

No quedan pendientes de gravedad alta en esta lista. La actualización de Angular, las
pruebas de interfaz y la simplificación del stack visual son deuda de mantenimiento, no
bloqueos para la demo.

**Ojo con los dos «pendiente» de arriba.** Esta tabla es una lista local del frontend, no el
inventario de la auditoría: `historico/hallazgos-2026.md` cierra sus 48 hallazgos y ninguno queda
abierto. Las filas 14 y 15 —`.toPromise()` deprecado y los ocho `.spec.ts` sin adaptar— son
mantenimiento menor que nunca entró en esos 48, y siguen ahí anotadas para no perderlas de
vista.
