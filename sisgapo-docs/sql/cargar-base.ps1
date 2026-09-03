<#
    Carga el esquema, la funcion Split, los procedimientos y los datos de
    demostracion en una base que ya existe. Sirve igual para SQL Server local,
    para el contenedor de docker compose y para Azure SQL: lo unico que cambia
    es el servidor y la forma de autenticarse.

    Ningun despliegue crea la base ni sus objetos: la API solo invoca
    procedimientos, no hay migraciones. Este script es el paso que falta entre
    "cree la base en el portal" y "el login funciona".

    Ejemplos

      # Azure SQL (la base hay que crearla antes en el portal)
      .\cargar-base.ps1 -Servidor sisgapo.database.windows.net -Usuario sisgapoadmin

      # SQL Server local con autenticacion de Windows
      .\cargar-base.ps1 -Servidor . -Integrado

      # Contenedor de docker compose (puerto 14330, ver docker-compose.yml)
      .\cargar-base.ps1 -Servidor "localhost,14330" -Usuario sa

    Ver ../07-migracion-tier-free.md, fase 5, y README.md de esta carpeta.
#>
param(
    [Parameter(Mandatory = $true)][string]$Servidor,
    [string]$Base = 'DB_SISGAPO',
    [string]$Usuario,
    [switch]$Integrado
)

$ErrorActionPreference = 'Stop'

[Console]::OutputEncoding = [Text.Encoding]::UTF8

if (-not (Get-Command sqlcmd -ErrorAction SilentlyContinue)) {
    Write-Error @'
No se encontro sqlcmd. Opciones:
  - Instalar las herramientas de linea de comandos de SQL Server, o
  - abrir los archivos 01..12 en orden desde SSMS o Azure Data Studio, o
  - para desarrollo local: docker compose up db-init
'@
    exit 1
}

$credenciales = @()

if ($Integrado) {
    $credenciales = @('-E')
} else {
    if (-not $Usuario) {
        Write-Error 'Indica -Usuario o usa -Integrado.'
        exit 1
    }

    $segura = Read-Host "Contrasenia de $Usuario" -AsSecureString
    $plana = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($segura))
    $credenciales = @('-U', $Usuario, '-P', $plana)
}

# -Filter lo resuelve el sistema de archivos, que solo entiende * y ?: un rango
# [0-9] ahi no casa con nada. El numero de orden se comprueba aparte.
$scripts = Get-ChildItem -Path $PSScriptRoot -Filter '*.sql' |
    Where-Object { $_.Name -match '^[0-9][0-9]-' } |
    Sort-Object Name

if ($scripts.Count -eq 0) {
    Write-Error "No hay scripts 01..12 en $PSScriptRoot."
    exit 1
}

Write-Host "==> $($scripts.Count) scripts sobre $Base en $Servidor"

foreach ($script in $scripts) {
    Write-Host "==> $($script.Name)"
    
    # -f es obligatorio: sin el, el sqlcmd de Windows lee los .sql con la pagina
    # de codigos ANSI y los acentos entran corruptos en la base.
    & sqlcmd -S $Servidor -d $Base @credenciales -b -I -C -f i:65001,o:65001 -i $script.FullName

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Fallo $($script.Name). Se detiene la carga."
        exit $LASTEXITCODE
    }
}

Write-Host ''
Write-Host '==> Base cargada. Comprueba los conteos que imprime 03-seed.sql:'
Write-Host '    25 productos, 33 lotes, 61 movimientos y "Lotes cuyo saldo no cuadra con su kardex = 0".'
Write-Host '    Cuentas de la demo: demo.admin, demo.supervisor y demo.asistente, con SisgapoDemo2026!'
