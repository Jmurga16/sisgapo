/* ============================================================================
   SISGAPO — Esquema de base de datos (versión corregida)
   ----------------------------------------------------------------------------
   Reemplaza a:  sisgapo-web/src/scripts/CreacionTablas.sql
                 sisgapo-web/src/scripts/CreacionTablasParte2.sql  (era un duplicado)

   Correcciones respecto al original — ver sisgapo-docs/03-modelo-de-datos.md, sección 4:
     [1] TBL_USUARIO.nRol        : la columna faltaba por completo, pero la usan
                                   PoblacionDatos.sql, USP_MNT_Usuarios,
                                   USP_MNT_Login y USP_MNT_Almacenes.
                                   Sin ella, la base de datos no se puede crear.
     [2] TBL_LOGIN               : no tenía clave primaria ni restricción única.
                                   Se añade PK sobre nIdUsuario y UNIQUE sobre
                                   sNombreUsuario.
     [3] TBL_DET_PRODUCTO.nIdLote: no tenía clave foránea (las demás sí).
     [4] VARCHAR(MAX)            : sustituido por longitudes acotadas en las
                                   columnas que participan en índices o joins.
                                   VARCHAR(MAX) no se puede indexar.
     [5] Eliminado el "USE DB_SISGAPO"  : lo maneja la conexión, no el script.
                                   Así el script sirve igual en Azure SQL, donde
                                   USE no está permitido.
     [6] Se eliminan objetos si existen, para que el script sea reejecutable.

   Ejecutar en este orden:
     01-esquema.sql  →  02-funcion-split.sql  →  03-seed.sql  →  04..09-usp-*.sql
   ============================================================================ */

/* ---------- Limpieza (permite reejecutar el script) ---------- */
IF OBJECT_ID('TBL_DET_PRODUCTO', 'U') IS NOT NULL DROP TABLE TBL_DET_PRODUCTO;
IF OBJECT_ID('TBL_CAT_PROD',     'U') IS NOT NULL DROP TABLE TBL_CAT_PROD;
IF OBJECT_ID('TBL_LOTE',         'U') IS NOT NULL DROP TABLE TBL_LOTE;
IF OBJECT_ID('TBL_UNIDADMEDIDA', 'U') IS NOT NULL DROP TABLE TBL_UNIDADMEDIDA;
IF OBJECT_ID('TBL_PRODUCTO',     'U') IS NOT NULL DROP TABLE TBL_PRODUCTO;
IF OBJECT_ID('TBL_CATEGORIA',    'U') IS NOT NULL DROP TABLE TBL_CATEGORIA;
IF OBJECT_ID('TBL_ALMACEN',      'U') IS NOT NULL DROP TABLE TBL_ALMACEN;
IF OBJECT_ID('TBL_LOGIN',        'U') IS NOT NULL DROP TABLE TBL_LOGIN;
IF OBJECT_ID('TBL_USUARIO',      'U') IS NOT NULL DROP TABLE TBL_USUARIO;
IF OBJECT_ID('TBL_ZONA',         'U') IS NOT NULL DROP TABLE TBL_ZONA;
IF OBJECT_ID('TBL_ROL',          'U') IS NOT NULL DROP TABLE TBL_ROL;
IF OBJECT_ID('TBL_DOCUMENTO',    'U') IS NOT NULL DROP TABLE TBL_DOCUMENTO;
GO

/* ============================ CATÁLOGOS ============================ */

-- Tipos de documento de identidad (DNI, carnet de extranjería)
CREATE TABLE TBL_DOCUMENTO (
    nIdDocumento INT           NOT NULL IDENTITY(1,1) PRIMARY KEY,
    sNombreDoc   VARCHAR(100)  NOT NULL
);
GO

-- Roles del sistema: Administrador, Supervisor, Asistente
CREATE TABLE TBL_ROL (
    nIdRol     INT          NOT NULL IDENTITY(1,1) PRIMARY KEY,
    sNombreRol VARCHAR(100) NOT NULL
);
GO

-- Zonas geográficas donde se ubican los almacenes
CREATE TABLE TBL_ZONA (
    nIdZona     INT          NOT NULL IDENTITY(1,1) PRIMARY KEY,
    sNombre     VARCHAR(200) NOT NULL,
    sRutaImagen VARCHAR(1000) NULL,         -- URL de imagen representativa
    bEstado     BIT          NOT NULL DEFAULT 1   -- baja lógica, como el resto de tablas
);
GO

/* ============================ USUARIOS ============================ */

CREATE TABLE TBL_USUARIO (
    nIdUsuario       INT          NOT NULL IDENTITY(1,1) PRIMARY KEY,
    sNombres         VARCHAR(200) NOT NULL,
    sApellidos       VARCHAR(200) NULL,
    nTipoDoc         INT          NULL,
    sNumDoc          VARCHAR(15)  NULL,
    sSexo            VARCHAR(1)   NULL,     -- 'M' | 'F'
    nRol             INT          NOT NULL, -- [1] CORRECCIÓN: columna que faltaba
    sDireccion       VARCHAR(300) NULL,
    nTelefono        INT          NULL,     -- ver 06-hallazgos.md, D-07: debería ser VARCHAR
    dFechaNacimiento DATE         NULL,
    bEstado          BIT          NOT NULL DEFAULT 1,   -- baja lógica

    CONSTRAINT FK_USUARIO_DOCUMENTO FOREIGN KEY (nTipoDoc) REFERENCES TBL_DOCUMENTO(nIdDocumento),
    CONSTRAINT FK_USUARIO_ROL       FOREIGN KEY (nRol)     REFERENCES TBL_ROL(nIdRol)
);
GO

-- Credenciales. Relación 1:1 con TBL_USUARIO.
-- sContrasenia guarda el hash BCrypt (60 caracteres) que genera LoginBusiness.
CREATE TABLE TBL_LOGIN (
    nIdUsuario     INT          NOT NULL,
    sNombreUsuario VARCHAR(100) NOT NULL,
    sContrasenia   VARCHAR(255) NOT NULL,

    -- [2] CORRECCIÓN: el original no tenía ni PK ni UNIQUE.
    CONSTRAINT PK_LOGIN        PRIMARY KEY (nIdUsuario),
    CONSTRAINT UQ_LOGIN_USER   UNIQUE (sNombreUsuario),
    CONSTRAINT FK_LOGIN_USUARIO FOREIGN KEY (nIdUsuario) REFERENCES TBL_USUARIO(nIdUsuario)
);
GO

/* ============================ ALMACENES ============================ */

CREATE TABLE TBL_ALMACEN (
    nIdAlmacen    INT          NOT NULL IDENTITY(1,1) PRIMARY KEY,
    sNombre       VARCHAR(200) NOT NULL,
    sDireccion    VARCHAR(300) NULL,
    nIdSupervisor INT          NOT NULL,   -- debe ser un usuario con nRol = 2
    nIdZona       INT          NOT NULL,
    bEstado       BIT          NOT NULL DEFAULT 1,

    CONSTRAINT FK_ALMACEN_SUPERVISOR FOREIGN KEY (nIdSupervisor) REFERENCES TBL_USUARIO(nIdUsuario),
    CONSTRAINT FK_ALMACEN_ZONA       FOREIGN KEY (nIdZona)       REFERENCES TBL_ZONA(nIdZona)
);
GO

/* ============================ INVENTARIO ============================ */

CREATE TABLE TBL_CATEGORIA (
    nIdCategoria INT          NOT NULL IDENTITY(1,1) PRIMARY KEY,
    sNombre      VARCHAR(200) NOT NULL,
    sDescripcion VARCHAR(500) NULL,
    bEstado      BIT          NOT NULL DEFAULT 1
);
GO

CREATE TABLE TBL_PRODUCTO (
    nIdProducto INT          NOT NULL IDENTITY(1,1) PRIMARY KEY,
    sNombre     VARCHAR(300) NOT NULL,
    bEstado     BIT          NOT NULL DEFAULT 1
);
GO

CREATE TABLE TBL_UNIDADMEDIDA (
    nIdUnidadMedida INT          NOT NULL IDENTITY(1,1) PRIMARY KEY,
    sNombre         VARCHAR(100) NOT NULL
);
GO

CREATE TABLE TBL_LOTE (
    nIdLote     INT          NOT NULL IDENTITY(1,1) PRIMARY KEY,
    sNombreLote VARCHAR(100) NOT NULL,
    dFechaFab   DATE         NULL,
    dFechaVenc  DATE         NULL
);
GO

-- Tabla puente: ubica un producto de una categoría en un almacén.
CREATE TABLE TBL_CAT_PROD (
    nIdCatProd   INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    nIdAlmacen   INT NULL,
    nIdCategoria INT NULL,
    nIdProducto  INT NULL,

    CONSTRAINT FK_CATPROD_ALMACEN   FOREIGN KEY (nIdAlmacen)   REFERENCES TBL_ALMACEN(nIdAlmacen),
    CONSTRAINT FK_CATPROD_CATEGORIA FOREIGN KEY (nIdCategoria) REFERENCES TBL_CATEGORIA(nIdCategoria),
    CONSTRAINT FK_CATPROD_PRODUCTO  FOREIGN KEY (nIdProducto)  REFERENCES TBL_PRODUCTO(nIdProducto)
);
GO

-- Detalle: cantidad, precio, unidad y lote de un producto.
CREATE TABLE TBL_DET_PRODUCTO (
    nIdDetProd      INT          NOT NULL IDENTITY(1,1) PRIMARY KEY,
    nIdProducto     INT          NULL,
    sDescripcion    VARCHAR(500) NULL,
    nIdUnidadMedida INT          NULL,
    nCantidad       INT          NULL,
    nPrecio         INT          NULL,     -- ver 06-hallazgos.md, D-06: debería ser DECIMAL
    nIdLote         INT          NULL,

    CONSTRAINT FK_DETPROD_PRODUCTO FOREIGN KEY (nIdProducto)     REFERENCES TBL_PRODUCTO(nIdProducto),
    CONSTRAINT FK_DETPROD_UM       FOREIGN KEY (nIdUnidadMedida) REFERENCES TBL_UNIDADMEDIDA(nIdUnidadMedida),
    -- [3] CORRECCIÓN: esta clave foránea faltaba en el original.
    CONSTRAINT FK_DETPROD_LOTE     FOREIGN KEY (nIdLote)         REFERENCES TBL_LOTE(nIdLote)
);
GO

/* ============================ ÍNDICES ============================ */
-- No existía ninguno en el original más allá de las claves primarias.
-- Estos cubren los joins y filtros que hacen los stored procedures.

CREATE INDEX IX_ALMACEN_ZONA        ON TBL_ALMACEN(nIdZona);
CREATE INDEX IX_ALMACEN_SUPERVISOR  ON TBL_ALMACEN(nIdSupervisor);
CREATE INDEX IX_USUARIO_ROL         ON TBL_USUARIO(nRol);
CREATE INDEX IX_CATPROD_ALMACEN     ON TBL_CAT_PROD(nIdAlmacen);
CREATE INDEX IX_CATPROD_CATEGORIA   ON TBL_CAT_PROD(nIdCategoria);
CREATE INDEX IX_CATPROD_PRODUCTO    ON TBL_CAT_PROD(nIdProducto);
CREATE INDEX IX_DETPROD_PRODUCTO    ON TBL_DET_PRODUCTO(nIdProducto);
GO
