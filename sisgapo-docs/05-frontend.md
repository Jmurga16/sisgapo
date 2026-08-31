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
├── app-routing.module.ts      9 rutas, ninguna protegida
├── login/                     componente + servicio de autenticación
├── inicio/                    página de bienvenida tras entrar
├── nav-menu/nav-menu/         barra lateral, control de sesión
├── shared/
│   ├── models/                contratos tipados de las respuestas HTTP
│   └── services/              AppDateAdapter (formato de fecha para Material)
└── modulos/
    ├── usuarios/              lista + modal + servicio
    ├── almacen/               lista + modal + servicio
    ├── zona/                  lista + formulario + servicio
    └── inventario/
        ├── categoria/         componente + modal
        ├── productos/         componente + modal
        └── inventario.service.ts   (compartido por categoría y productos)
```

**Un solo `NgModule`.** Los 14 componentes se declaran en `app.module.ts` y se cargan todos en
el bundle inicial: `main-es2015.js` pesa 877 kB. Para cinco pantallas es asumible, pero
dividir en módulos con carga diferida es la mejora obvia si el sistema creciera.

## 3. Rutas

| Ruta | Componente | Protegida |
|---|---|---|
| `''` | redirige a `login` | — |
| `login` | **`NavMenuComponent`** | no |
| `inicio` | `InicioComponent` | no |
| `usuarios` | `UsuariosListComponent` | no |
| `almacenes` | `AlmacenesListComponent` | no |
| `zonas` | `ZonaListComponent` | no |
| `zonas/agregar` | `ZonaFormComponent` | no |
| `zonas/editar/:id` | `ZonaFormComponent` | no |
| `categoria` | `CategoriaComponent` | no |
| `productos` | `ProductosComponent` | no |

Dos cosas a notar:

**No hay ni un `canActivate` en todo el archivo.** Cualquier ruta es accesible escribiéndola
en la barra de direcciones. Ver `06-hallazgos.md` §S-04.

**La ruta `login` apunta a `NavMenuComponent`, no a `LoginComponent`.** `NavMenuComponent`
decide qué mostrar según `localStorage.getItem("Rol")`: si no hay rol, renderiza el login
dentro de su plantilla; si lo hay, muestra la barra lateral. Es un patrón poco habitual
—el componente de navegación hace de guardián y de contenedor a la vez— y explica por qué el
árbol de rutas se ve raro a primera vista.

## 4. Sesión y control de acceso

La sesión completa cabe en tres líneas repartidas por el código:

```typescript
// login.component.ts — al entrar
localStorage.setItem('Rol', value[0].nIdRol);

// nav-menu.component.ts — al arrancar
this.Rol = parseInt(localStorage.getItem("Rol"));

// nav-menu.component.ts — al salir
localStorage.clear();
```

No hay token, ni expiración, ni renovación, ni cabecera `Authorization` en ninguna llamada.
El valor guardado es un número (`1`, `2` o `3`) que cualquiera puede escribir desde la consola
del navegador.

Y **el rol no cambia la interfaz**: `listaNav` en `nav-menu.component.ts` es un arreglo fijo
con las cuatro entradas de menú, sin filtrado por rol. Los componentes de lista muestran los
botones de crear, editar y eliminar a todo el mundo.

La distinción Administrador / Supervisor que define el documento de casos de uso
—el administrador gestiona usuarios, almacenes y zonas; el supervisor gestiona categorías—
**no está implementada en ninguna capa**.

## 5. Servicios

Seis servicios. Cinco usan `HttpClient.post(...).toPromise()` y `ZonaService` conserva
observables porque es el único módulo REST.

| Servicio | Endpoint | Patrón |
|---|---|---|
| `LoginService` | `POST /LoginService` | objeto tipado |
| `PanelService` | `POST /Panel` | `sOpcion` + `join('|')` |
| `UsuariosService` | `POST /UsuariosService` | `sOpcion` + `join('|')` |
| `AlmacenesService` | `POST /AlmacenesService` | `sOpcion` + `join('|')` |
| `InventarioService` | `POST /InventarioService/{Categoria,Producto}` | `sOpcion` + `join('|')` |
| `ZonaService` | `GET/POST /api/zona` | REST, objeto tipado |

Los cuatro servicios del patrón `sOpcion` aplanan el arreglo:

```typescript
const params = { sOpcion: sOpcion, pParametro: pParametro.join('|') };
return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
```

Observaciones:

- **`.toPromise()` en todo.** Está deprecado desde RxJS 7 y eliminado en RxJS 8; los componentes usan `async/await` en lugar de suscripciones. Funciona, pero desaprovecha la cancelación automática y los operadores de RxJS. `ZonaService` es el único que devuelve observables y usa `.subscribe()`.
- **`JSON.stringify` manual.** `HttpClient` ya serializa el cuerpo; hacerlo a mano y además fijar `Content-Type` es redundante.
- **Sin interceptor HTTP.** No hay un punto único para añadir cabeceras, manejar errores o mostrar un indicador de carga. Cada componente hace su propio `(error) => console.log(error)`.
- **Respuestas tipadas.** Los contratos de cada opción viven en `shared/models/` y los
  servicios son genéricos. El formato delimitado de `pParametro` sigue sin tipado en el
  backend; esta mejora solo evita `any` dentro del frontend.

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

`ZonaFormComponent` rompe el patrón: es una página completa en vez de un modal. Hasta
2026 tenía además un defecto grave —su modo edición no editaba, siempre insertaba—,
documentado en `06-hallazgos.md` §C-03 y ya corregido: ahora llama a `updateZona()` cuando
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
redirección desde HTTP. Ver `06-hallazgos.md` §S-08.

## 9. Despliegue

Dos workflows en `.github/workflows/`, ambos hacia Azure Static Web Apps:

| Archivo | `output_location` |
|---|---|
| `azure-static-web-apps-blue-sea-0c3542710.yml` | `dist` |
| `azure-static-web-apps-yellow-meadow-0e36f1a10.yml` | `dist/SISGAPO-Front` |

**El primero está mal.** `angular.json` define `"outputPath": "dist/SISGAPO-Front"`, así que
el workflow `blue-sea` publicaría un directorio que no contiene la aplicación. Parece que se
creó un recurso, no funcionó, se creó otro y nunca se borró el primero.

Además, **ninguno de los dos workflows funcionaría hoy**: usan `actions/checkout@v2` y no
fijan la versión de Node, así que el runner usaría una versión moderna y el build fallaría
con el error de OpenSSL descrito en §1 — salvo que se añada `NODE_OPTIONS`.

Para la demo, esto se arregla con dos líneas en el workflow:

```yaml
env:
  NODE_OPTIONS: --openssl-legacy-provider
```

y borrar el workflow sobrante. Ver `07-migracion-tier-free.md` §6.

## 10. Resumen de problemas del frontend

| # | Problema | Gravedad | Dónde | Estado |
|---|---|---|---|---|
| 1 | Ninguna ruta protegida | 🔴 | `app-routing.module.ts` | pendiente |
| 2 | Editar zona crea un duplicado | 🔴 | `zona-form.component.ts` | corregido |
| 3 | Editar producto envía 10 parámetros de 11 | 🔴 | `productos-modal.component.ts` | corregido |
| 4 | Sesión = un número en `localStorage` | 🔴 | `login.component.ts` | pendiente |
| 5 | El formulario de acceso no responde al clic con la ventana baja | 🔴 | `login.component.css` | corregido |
| 6 | El rol no filtra menús ni acciones | 🟠 | `nav-menu.component.ts` | pendiente |
| 7 | `if (!this.fnValidarImagen)` sin `()` | 🟠 | `zona-form.component.ts` | corregido |
| 8 | Sin diseño para móvil en la pantalla de acceso | 🟠 | `login.component.css` | corregido |
| 9 | Los filtros de Productos no filtraban | 🟠 | `productos.component.ts` | corregido |
| 10 | Sin interceptor HTTP y con manejo de errores desigual | 🟠 | servicios y componentes | pendiente |
| 11 | Workflow con `output_location` incorrecto | 🟠 | `.github/workflows/` | corregido |
| 12 | URL cableada en `InicioComponent` | 🟡 | `inicio.component.ts` | corregido |
| 13 | Errores silenciosos al iniciar sesión | 🟡 | `login.component.ts` | corregido |
| 14 | `.toPromise()` deprecado | 🟡 | cinco servicios | pendiente |
| 15 | 8 `.spec.ts` sin adaptar | 🟡 | todo el proyecto | pendiente |
| 16 | Un solo módulo, sin carga diferida | 🟡 | `app.module.ts` | pendiente |
| 17 | Tres sistemas de estilos conviviendo | 🟡 | `styles.css` | mitigado — Bootstrap reducido a grid |

Los pendientes de gravedad alta son los dos de sesión y rol: van juntos con la
autenticación. El resto se documenta en `06-hallazgos.md` con su reproducción.
