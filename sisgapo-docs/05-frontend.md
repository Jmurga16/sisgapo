# 05 — Frontend

Aplicación Angular 9 de página única. Código en `sisgapo-web/src/`.

## 1. Cómo levantarlo

```bash
cd sisgapo-web
npm install --legacy-peer-deps

# El flag NO es opcional en Node 17 o superior
NODE_OPTIONS=--openssl-legacy-provider npx ng serve        # http://localhost:4200
NODE_OPTIONS=--openssl-legacy-provider npx ng build --prod # dist/SISGAPO-Front
```

**Por qué hace falta el flag.** Angular 9 usa Webpack 4, que calcula hashes de módulo con
`crypto.createHash('md4')`. OpenSSL 3 —el que trae Node 17 y posteriores— retiró MD4 del
proveedor por defecto. Sin el flag, el build muere con:

```
error:0308010C:digital envelope routines::unsupported
```

`--openssl-legacy-provider` reactiva el proveedor antiguo. **Verificado en Node 22.23.1:**
con el flag, `npm install` (1481 paquetes, 32 s) y `ng build --prod` (32 s) funcionan sin
tocar una línea de código.

`--legacy-peer-deps` hace falta porque npm 7+ aplica los rangos de dependencias entre pares
de forma estricta, y `@ng-bootstrap` 6 declara Bootstrap 4 mientras el proyecto trae
Bootstrap 5.

Conviene fijarlo en `package.json` para no depender de que alguien recuerde el flag:

```jsonc
"scripts": {
  "start": "cross-env NODE_OPTIONS=--openssl-legacy-provider ng serve",
  "build": "cross-env NODE_OPTIONS=--openssl-legacy-provider ng build --prod"
}
```
(requiere `npm i -D cross-env` para que funcione igual en Windows y Linux)

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
        ├── movimientos/       componente + modal (kardex)
        └── inventario.service.ts   (compartido por las cuatro pantallas)
```

**Un solo `NgModule`.** Los 18 componentes se declaran en `app.module.ts` y se cargan todos en
el bundle inicial: `main` pesa unos 966 kB. Para siete pantallas sigue siendo asumible, pero
dividir en módulos con carga diferida es la mejora obvia si el sistema creciera.

## 3. Rutas

| Ruta | Componente | Protegida |
|---|---|---|
| `''` | redirige a `login` | — |
| `login` | **`NavMenuComponent`** | no |
| `inicio` | `InicioComponent` | sesión |
| `usuarios` | `UsuariosListComponent` | administrador |
| `almacenes` | `AlmacenesListComponent` | administrador o supervisor |
| `zonas` | `ZonaListComponent` | administrador o supervisor |
| `zonas/agregar` | `ZonaFormComponent` | administrador o supervisor |
| `zonas/editar/:id` | `ZonaFormComponent` | administrador o supervisor |
| `categoria` | `CategoriaComponent` | sesión |
| `productos` | `ProductosComponent` | sesión |
| `lotes` | `LotesComponent` | sesión |
| `movimientos` | `MovimientosComponent` | sesión |

Las dos últimas aceptan un parámetro de consulta que preselecciona el filtro:
`lotes?producto=1` llega desde el botón «Lotes» del listado de productos, y
`movimientos?lote=1` desde el botón «Kardex» del listado de lotes. Es el recorrido natural
de la demo: catálogo → partidas → historia de una partida.

**La ruta `login` apunta a `NavMenuComponent`, no a `LoginComponent`.** `NavMenuComponent`
decide qué mostrar según la sesión: si no existe, renderiza el login dentro de su plantilla;
si existe, muestra la barra lateral. Es un patrón poco habitual
—el componente de navegación hace de guardián y de contenedor a la vez— y explica por qué el
árbol de rutas se ve raro a primera vista.

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

El menú se filtra por rol. El administrador gestiona usuarios; administrador y supervisor
gestionan almacenes, zonas, catálogo y lotes; el asistente consulta el inventario y **registra
entradas y salidas**. El ajuste —corregir la existencia sin documento que lo respalde— queda
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
lote preseleccionado en vez de `{ accion, nId }`.

`ZonaFormComponent` rompe el patrón: es una página completa en vez de un modal. Hasta
2026 tenía además un defecto grave —su modo edición no editaba, siempre insertaba—,
documentado en `06-hallazgos.md`, C-03 y ya corregido: ahora llama a `updateZona()` cuando
la ruta trae `:id`, y el módulo tiene actualización y baja lógica en las tres capas.

La validación de imagen llama ahora a `fnValidarImagen()`, acepta las URL sin extensión de
Unsplash y admite `.png`, `.jpg`, `.jpeg` y `.webp` aunque haya parámetros de consulta.

## 7. Interfaz y estilos

- **Angular Material 9** como base: `MatTable`, `MatDialog`, `MatSidenav`, `MatPaginator`, `MatDatepicker`, `MatSelect`.
- **Bootstrap 5.0.2**, del que solo se cargan *reboot* y *grid*: la aplicacion usa
  unicamente `row`, `col-md-*` y `justify-content-center`. Cargar el framework completo
  costaba 96 KB de CSS bloqueante sin usarlos.
- **`@ng-bootstrap` 6.2.0**, que está hecho para Bootstrap 4 → desajuste de versión.
- **`@ng-select`** para los desplegables con búsqueda.
- **SweetAlert2** para confirmaciones y avisos.

Tres sistemas de estilos conviviendo. Funciona, pero produce inconsistencias visuales —
botones de Material junto a botones de Bootstrap, espaciados que no cuadran— y hace que
el CSS global sea más difícil de mantener. Las listas comparten ahora cabecera, filtros,
scroll horizontal, acciones y paginador responsive en `styles.css`; los estilos propios
quedan en cada componente.

`AppDateAdapter` (`shared/services/AppDateAdapter.ts`) adapta el formato de fecha de Material
al formato que espera el backend.

## 8. Configuración de entorno

```typescript
// environment.ts
{ production: false, API_URL_INV: "https://localhost:44360/" }

// environment.prod.ts
{ production: true,  API_URL_INV: "https://localhost:44360/" }
```

El host de producción sigue pendiente hasta que exista el despliegue definitivo. Mientras
tanto usa HTTPS local para no llamar al App Service eliminado ni romper CORS con una
redirección desde HTTP. Ver `06-hallazgos.md`, S-08.

## 9. Despliegue

El repositorio conserva un único workflow, `.github/workflows/ci.yml`, con tres trabajos:
compilación y pruebas del backend, pruebas de integración contra un SQL Server levantado con
`docker compose`, y build de producción del frontend con Node 22 y el lockfile, en cada push
y pull request. Los workflows antiguos de Azure Static Web Apps se retiraron porque los
recursos ya no existen. El despliegue público nuevo sigue pendiente; ver
`07-migracion-tier-free.md` y `11-estado-portafolio.md`.

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
| 16 | Un solo módulo, sin carga diferida | 🟡 | `app.module.ts` | pendiente |
| 17 | Tres sistemas de estilos conviviendo | 🟡 | `styles.css` | mitigado — Bootstrap reducido a grid |

No quedan pendientes de gravedad alta en esta lista. La actualización de Angular, las
pruebas de interfaz y la simplificación del stack visual son deuda de mantenimiento, no
bloqueos para la demo.
