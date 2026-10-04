# Migración a un VPS de Contabo — octubre de 2026

> **Documento histórico.** Fue `10-migracion-contabo.md` hasta el 4 de octubre de 2026, el día
> en que se ejecutó. Se conserva como se escribió, con el plan y lo que cambió al aplicarlo: la
> infraestructura vigente y cómo redesplegarla están en
> [`../06-infraestructura.md`](../06-infraestructura.md), y el porqué de los cambios, en
> `../09-decisiones.md`, D-49 y D-52. Las rutas a otros documentos apuntan a la carpeta
> superior.

> **Estado: ejecutada el 4 de octubre de 2026.** La demo corre en
> `https://sisgapo.devkora.com`. Lo desplegado no es exactamente lo que se escribe abajo: el
> VPS ya tenía un proxy común, y eso cambió tres piezas. La sección 0 dice qué cambió; los
> archivos que mandan son los de `deploy/`, `sisgapo-api/Dockerfile` y `sisgapo-web/Dockerfile`,
> no los bocetos de la sección 4.

## 0. Cómo quedó

- **Sin Caddy propio.** El 80 y el 443 son de un Caddy común que reparte por subdominio a
  todas las demos del servidor. SISGAPO se une a su red `edge`, deja su bloque en
  `sites/sisgapo.caddy` y no publica ningún puerto.
- **Un solo dominio, sin subdominio para la API.** La web reenvía `/api/*` a la API dentro de
  la red de Compose y quita el prefijo, así que los endpoints no cambian: `/api/LoginService`
  llega como `/LoginService`, y `/api/api/zona`, como `/api/zona`. `environment.prod.ts` usa la
  ruta relativa `/api/`: mismo origen, sin CORS y con un solo registro A.
- **Un login propio para la API.** `docker/init-db.sh` crea `sisgapo_app`, con permiso de
  ejecución sobre `dbo`, cuando recibe su contraseña; `sa` lo usa únicamente la carga.
- **Cada despliegue recarga la base** con `deploy/sembrar.sh`, el mismo script del cron.
- **El cron va a las 10:00 del servidor**, que está en hora de Europa central: las 03:00 de Lima.
- **La web es Caddy, no nginx**, como las demás demos del servidor, con la CSP y las cabeceras
  en `sisgapo-web/deploy/Caddyfile`.
- **Azure no se borra.** Se queda en sus planes gratuitos como prueba de concepto y vuelta
  atrás; la copia del frontend en Hostinger sí se retiró.

Verificado ese día: certificado de Let's Encrypt; panel en menos de un segundo; el seed con
«Lotes cuyo saldo no cuadra con su kardex = 0»; altas y cambios de estado con `sisgapo_app`;
y H-05, porque seis intentos fallidos desde una IP bloquean esa IP y no otra, y una
`X-Forwarded-For` inventada no cambia la cuenta. El porqué de los cambios está en
`09-decisiones.md`, D-52.

## 1. Por qué plantearlo

La demo cuesta US$ 0 en Azure, pero lo paga de otra forma:

- **Arranque en frío.** La API responde en 18 segundos cuando lleva un rato parada
  (medido hoy, sin tocar la base); la base *serverless* se pausa aparte. Toda la
  interfaz de carga y reintento de C-21 existe para disimularlo.
- **Dos ofertas gratuitas con letra pequeña.** App Service F1 da 60 minutos de CPU al
  día y 1 GB de memoria; Azure SQL en su oferta gratuita, 100 000 segundos de vCore al
  mes y 32 GB, y se pausa hasta el mes siguiente si se agotan. Son términos que el
  proveedor puede cambiar, y D-01 ya lo anotaba como riesgo.
- **El reinicio periódico del seed no tiene dónde programarse.** Es el único pendiente
  de infraestructura desde septiembre, y en Azure cualquier solución gratuita pasa por
  abrir el cortafuegos de la base o montar más piezas (R-03 del documento 06).

Si ya se paga un VPS, el cálculo cambia. La premisa de D-02 —«fuera de Azure no hay SQL
Server gratuito gestionado»— sigue siendo cierta, pero deja de importar: **SQL Server
2022 Express en un contenedor cuesta US$ 0 adicionales** y conserva el 100 % del T-SQL,
así que D-01 se mantiene intacta. Lo que se pierde es la operación cero: en Azure nadie
parchea nada; en el VPS, el sistema operativo, Docker, los certificados y los parches son
responsabilidad propia.

## 2. Qué se necesita del servidor

| Requisito | Mínimo | Por qué |
|---|---|---|
| Arquitectura | x86-64 | La imagen `mcr.microsoft.com/mssql/server` no tiene variante ARM. Los VPS de Contabo son x86 |
| Memoria libre | ~3 GB (4 GB si el servidor no hace nada más; 8 GB sobrado) | SQL Server exige 2 GB para arrancar y se le limita a 2 GB con `MSSQL_MEMORY_LIMIT_MB`; la API ocupa 150–200 MB; el proxy, menos de 50 MB |
| Disco | ~5 GB | 1,5 GB de imagen de SQL Server, menos de 100 MB de datos, unos 300 MB entre API y frontend |
| Docker | Docker Engine con Compose v2 | El mismo `init-db.sh` y los mismos scripts de `sql/` que ya usa el entorno local |
| Puertos abiertos | 22 (solo clave SSH), 80 y 443 | El 1433 **no se publica**: la base solo existe en la red interna de Compose |
| Nombre | Un dominio o subdominio apuntando a la IP | Sin nombre no hay certificado de Let's Encrypt. `sslip.io` sirve para probar, no para la demo pública: comparte el límite de certificados con todo el mundo |

Los planes de entrada de Contabo (del orden de 4 vCPU y 8 GB de RAM por unos US$ 5–9 al
mes, según la oferta vigente) sobran. SQL Server Express, además, es gratuito también en
producción —a diferencia de la edición Developer, que no se puede usar para servir—; sus
límites (10 GB por base, 1,4 GB de caché, 4 núcleos) quedan lejos de lo que mueve la
demo. El `docker-compose.yml` de desarrollo ya usa `MSSQL_PID=Express`: se mantiene.

## 3. Arquitectura propuesta

```
Internet
  │
  ▼  443
┌──────────────────────────────┐
│  proxy (Caddy)               │  TLS automático con Let's Encrypt
│  sisgapo.<dominio>     ──────┼──►  web  (nginx, dist/SISGAPO-Front)
│  api.sisgapo.<dominio> ──────┼──►  api  (Kestrel :8080)
└──────────────────────────────┘          │
                                          ▼
                                     db (SQL Server 2022 Express)
                                     red interna, sin puerto publicado
                                          ▲
                           db-init ───────┘  un solo uso: esquema + seed
                           (lo lanza el cron cada noche)
```

**La API en un subdominio, no bajo un prefijo.** Es el cambio más pequeño: la aplicación
ya llama a la API por una URL absoluta (`environment.prod.ts`) y el CORS ya sale de
configuración. Los endpoints no comparten prefijo (`/LoginService`, `/Panel`,
`/InventarioService/...`, `/api/zona`), así que servirlos bajo `/api` obligaría a
reescribir rutas o a usar `UsePathBase`. Ponerlo todo en el mismo origen tiene una ventaja
real —permitiría pasar el token a una cookie `HttpOnly`, lo que D-24 descartó por tener dos
dominios— pero es un segundo proyecto; queda anotado como opción.

**Si el VPS ya tiene Apache o nginx sirviendo otras cosas**, no hace falta Caddy: un
*virtual host* para el frontend con `DocumentRoot` en el `dist/` —el `.htaccess` que ya
incluye el build hace el *fallback* de la SPA y la caché— y otro para la API con
`ProxyPass` a `127.0.0.1:8080`. En ese caso el servicio `api` publica el puerto solo en
`127.0.0.1` y el servicio `proxy` sobra.

## 4. Piezas que faltan en el repositorio

Nada de esto existe hoy. Los archivos están completos para copiarlos tal cual; las imágenes
deben usar .NET 10, de acuerdo con H-01.

### `sisgapo-api/Dockerfile`

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY SISGAPO_Back.sln ./
COPY SISGAPO_API/SISGAPO_API.csproj SISGAPO_API/
COPY Business/Business.csproj Business/
COPY Data/Data.csproj Data/
COPY Entity/Entity.csproj Entity/
COPY Test/Test.csproj Test/
RUN dotnet restore SISGAPO_Back.sln
COPY . .
RUN dotnet publish SISGAPO_API/SISGAPO_API.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "SISGAPO_API.dll"]
```

`nlog.config` viaja con el `publish` porque el `.csproj` lo marca `PreserveNewest`; el
destino de archivo escribe dentro del contenedor y se pierde al recrearlo, lo cual está
bien: lo que se lee es la consola, con `docker compose logs api`.

### `sisgapo-web/Dockerfile` y `sisgapo-web/nginx.conf`

```dockerfile
FROM node:22-alpine AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /src/dist/SISGAPO-Front /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

```nginx
server {
    listen 80;
    root  /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location ~* \.(js|css|svg|ico|png)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

El compilador de Angular es una dependencia de desarrollo: por eso el `npm ci` no lleva
`--omit=dev`. Desde Angular 14 el build no necesita `NODE_OPTIONS` (D-51). Antes de
construir la imagen, `environment.prod.ts` tiene que apuntar a `https://api.sisgapo.<dominio>/`.
Conviene un `.dockerignore` con `node_modules`, `dist` y `coverage` en los dos proyectos.

### `docker-compose.prod.yml` (en la raíz, junto al de desarrollo)

```yaml
services:

  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      ACCEPT_EULA: "Y"
      MSSQL_PID: "Express"
      MSSQL_SA_PASSWORD: "${MSSQL_SA_PASSWORD}"
      MSSQL_MEMORY_LIMIT_MB: "2048"
      TZ: "America/Lima"
    volumes:
      - sisgapo-datos:/var/opt/mssql
    healthcheck:
      test: ["CMD-SHELL", "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P \"$$MSSQL_SA_PASSWORD\" -C -Q 'SELECT 1' || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 15
      start_period: 20s
    restart: unless-stopped

  db-init:
    image: mcr.microsoft.com/mssql/server:2022-latest
    profiles: ["seed"]
    depends_on:
      db:
        condition: service_healthy
    environment:
      MSSQL_SA_PASSWORD: "${MSSQL_SA_PASSWORD}"
    volumes:
      - ./sisgapo-docs/sql:/sql:ro
      - ./docker/init-db.sh:/init-db.sh:ro
    entrypoint: ["/bin/bash", "/init-db.sh"]
    restart: "no"

  api:
    build: ./sisgapo-api
    environment:
      ASPNETCORE_ENVIRONMENT: "Production"
      ASPNETCORE_URLS: "http://+:8080"
      ASPNETCORE_FORWARDEDHEADERS_ENABLED: "true"
      SISGAPO_CONNECTION_STRING: "Server=db;Database=DB_SISGAPO;User ID=sa;Password=${MSSQL_SA_PASSWORD};TrustServerCertificate=True"
      SISGAPO_JWT_KEY: "${SISGAPO_JWT_KEY}"
      Cors__OrigenesPermitidos__0: "https://${DOMINIO_WEB}"
      Demo__SoloLectura: "false"
      TZ: "America/Lima"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  web:
    build: ./sisgapo-web
    restart: unless-stopped

  proxy:
    image: caddy:2
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy-datos:/data
    depends_on:
      - web
      - api
    restart: unless-stopped

volumes:
  sisgapo-datos:
  caddy-datos:
```

Tres detalles que no son decorativos:

- **`profiles: ["seed"]` en `db-init`.** Así `docker compose up -d` no lo arranca; se
  lanza a propósito con `docker compose -f docker-compose.prod.yml run --rm db-init`,
  que es lo que hace el cron de la sección 6. El `init-db.sh` es el mismo de desarrollo.
- **`ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`.** Sin esto, el límite de cinco intentos
  de acceso por minuto cuenta la IP del proxy para todas las personas (H-05).
- **`TZ=America/Lima` en la base y en la API.** `GETDATE()` y las etiquetas «Hoy» y
  «Ayer» de la cronología usan la hora del servidor; en Azure SQL es UTC y los
  movimientos registrados por la noche aparecen al día siguiente.

### `docker/Caddyfile`

```
sisgapo.ejemplo.pe {
    reverse_proxy web:80
}

api.sisgapo.ejemplo.pe {
    reverse_proxy api:8080
}
```

Caddy pide y renueva los certificados solo, y añade `X-Forwarded-For` y
`X-Forwarded-Proto` a cada petición, que es lo que la API necesita para el límite de
intentos y para no intentar redirigir a HTTPS algo que ya lo es.

### `.env` de producción (no se versiona; `.gitignore` ya lo excluye)

```
MSSQL_SA_PASSWORD=<distinta de la de desarrollo; sin ; ni $>
SISGAPO_JWT_KEY=<openssl rand -base64 48>
DOMINIO_WEB=sisgapo.ejemplo.pe
```

## 5. Configuración de la API en el VPS

Es la misma tabla de `06-infraestructura.md`, sección 7, con dos filas nuevas:

| Variable | Valor | Por qué |
|---|---|---|
| `SISGAPO_CONNECTION_STRING` | `Server=db;Database=DB_SISGAPO;User ID=sa;Password=…;TrustServerCertificate=True` | `db` es el nombre del servicio en la red de Compose; el certificado de SQL Server es autofirmado |
| `SISGAPO_JWT_KEY` | 32 caracteres o más, al azar | Igual que hoy. Cambiarla invalida las sesiones abiertas |
| `Cors__OrigenesPermitidos__0` | `https://sisgapo.<dominio>` | Sin barra final |
| `ASPNETCORE_FORWARDEDHEADERS_ENABLED` | `true` | **Nueva.** H-05 |
| `ASPNETCORE_URLS` | `http://+:8080` | **Nueva.** Kestrel escucha solo HTTP; el TLS lo termina el proxy |
| `Demo__SoloLectura` | `false` | Las escrituras siguen abiertas; el control es el reinicio del seed, como en S-11 |
| `ASPNETCORE_ENVIRONMENT` | `Production` | `appsettings.Development.json` no se carga |

Y una comprobación que solo tiene sentido aquí: desde dos redes distintas (la del
portátil y la del teléfono con datos), seis intentos fallidos desde una no deben bloquear
el acceso desde la otra. Si lo bloquean, las cabeceras no están llegando.

## 6. El reinicio periódico del seed

Es el pendiente de la auditoría de cierre (`auditoria-cierre-2026-10.md`, R-03), y aquí es una línea en el `crontab` del
usuario que gestiona Docker:

```
0 4 * * * cd /opt/sisgapo && docker compose -f docker-compose.prod.yml run --rm db-init >> /var/log/sisgapo-seed.log 2>&1
```

A las cuatro de la mañana (hora del servidor, que es la de Lima por el `TZ`) el esquema se
borra y se vuelve a crear, el seed entra con las fechas relativas de D-16 y el invariante
del kardex se verifica al final, como siempre. Durante los diez o quince segundos que dura,
las peticiones a la API fallan y el reintento de `a56ce16` las cubre en parte; es un
precio aceptable a esa hora. No hace falta copia de seguridad de los datos: **el seed es
la copia de seguridad**, y lo único que conviene guardar fuera del servidor es el `.env`.

## 7. Endurecimiento mínimo

Lo que en Azure venía puesto y aquí hay que poner:

- **Acceso.** SSH solo con clave, `PermitRootLogin no`, un usuario sin privilegios con
  acceso a Docker; `ufw` con 22, 80 y 443 y nada más; `fail2ban` para el SSH.
- **Parches.** `unattended-upgrades` para el sistema; `docker compose pull && docker
  compose up -d` una vez al mes para las imágenes. La de SQL Server conviene fijarla a una
  actualización acumulativa concreta en vez de `2022-latest`, para que el mes que se
  actualice sea uno elegido.
- **Registros.** Rotación en Docker (`"log-driver": "json-file"` con `max-size` y
  `max-file` en `/etc/docker/daemon.json`); sin ella, `docker compose logs` crece hasta
  llenar el disco.
- **Secretos.** La contraseña de `sa` del VPS es distinta de la de desarrollo
  (`Sisgapo!Demo2026` es pública en el README); el `.env` tiene permisos `600` y una
  copia en un gestor de contraseñas.
- **Disponibilidad.** `restart: unless-stopped` en los cuatro servicios y una
  comprobación externa gratuita (UptimeRobot o similar, cada cinco minutos contra
  `/ConfiguracionService`) que avise si la demo se cae. En Azure no hacía falta; aquí
  nadie más la mira.

## 8. Plan de migración y vuelta atrás

| Paso | Qué | Comprobación |
|---|---|---|
| 1 | En una rama: `Dockerfile` de API y web, `nginx.conf`, `docker-compose.prod.yml`, `Caddyfile`, `.dockerignore`. Probar en local con `docker compose -f docker-compose.prod.yml up --build` (Caddy puede quedarse fuera en local) | Login, listados y un movimiento por HTTP contra `localhost` |
| 2 | En el VPS: Docker, usuario, `ufw`, clonar el repositorio en `/opt/sisgapo`, `.env` con permisos `600` | `docker compose config` sin errores |
| 3 | DNS: `sisgapo.<dominio>` y `api.sisgapo.<dominio>` a la IP del VPS | `dig` resuelve |
| 4 | `environment.prod.ts` a la nueva API; `docker compose -f docker-compose.prod.yml up -d --build`; `run --rm db-init` | Caddy obtiene los certificados; la carga imprime los conteos del seed |
| 5 | La lista de verificación de `06-infraestructura.md`, sección 7, más la comprobación de H-05 y la de zona horaria (un movimiento registrado ahora aparece bajo «Hoy») | Todo en verde |
| 6 | Cron de la sección 6; esperar una noche y comprobar `sisgapo-seed.log` | Conteos correctos y «Lotes cuyo saldo no cuadra con su kardex = 0» |
| 7 | README con el enlace nuevo; `06-infraestructura.md` pasa a describir el VPS y Azure queda como histórico | — |
| 8 | ~~Una semana después, borrar los recursos de Azure~~. **Cambiado al ejecutarlo:** Azure se conserva como prueba de concepto del tier gratuito y como vuelta atrás; lo que se retira es la copia del frontend en Hostinger | *Cost Management* en US$ 0, con los recursos en sus planes gratuitos |

**Vuelta atrás:** hasta el paso 8 Azure sigue intacto; volver es cambiar el enlace del
README y, si se cambió, el DNS. Por eso el paso 8 espera una semana.

**Esfuerzo:** medio día (4–6 h) si el VPS ya tiene Docker; dos horas más si H-01 se hace
en la misma tanda, que es lo recomendable para no construir imágenes de un runtime que
caduca en noviembre.

## 9. Lo que se gana y lo que se arriesga

| | Azure hoy | VPS de Contabo |
|---|---|---|
| Costo marginal | US$ 0 | US$ 0 (el servidor ya se paga; solo para esto costaría US$ 5–9 al mes) |
| Arranque en frío | Sí: API y base se duermen; 18 s medidos | No |
| Límites | 60 min de CPU al día; 100 000 vCore·s al mes; auto-pausa | Los del plan: sobran |
| Reinicio del seed | Sin resolver | Una línea de cron |
| TLS y nombre | Incluidos en `*.azurewebsites.net` y `*.azurestaticapps.net` | Hace falta un dominio; el certificado es gratis |
| Operación | Ninguna | Sistema, Docker, parches y registros: propios |
| Riesgo de cambio de términos | Medio: dos ofertas gratuitas | Bajo: un contrato |
| Punto único de fallo | No: dos servicios gestionados | Sí: un servidor. Para una demo, aceptable |
| Qué demuestra en el portafolio | Saber usar el tier gratuito | Contenerizar y operar el sistema completo, que es lo que D-08 señalaba como lo más valioso |

## 10. Recomendación

**Hacerlo**, en este orden: H-01 (.NET 10) → contenedores en una rama, probados en local
→ VPS → una semana de convivencia → borrar Azure. Es el mismo tipo de cambio que la
migración de agosto, con una ventaja: esta vez el entorno de destino es el mismo
`docker compose` que ya levanta el sistema en cualquier máquina, así que lo que funcione
en local funcionará en el servidor.

Lo que lo haría cambiar: que el VPS esté por debajo de 4 GB de memoria libre, o que no
haya un dominio al que colgarlo. En cualquiera de los dos casos, la alternativa es
quedarse en Azure y resolver el reinicio del seed con R-03.

La decisión quedó confirmada como D-49 en `09-decisiones.md` y se ejecutó el 4 de octubre de
2026; lo que cambió está en la sección 0.
