/* ============================================================================
   SISGAPO — Datos de demostración
   ----------------------------------------------------------------------------
   Reemplaza a:  sisgapo-web/src/scripts/PoblacionDatos.sql
                 sisgapo-web/src/scripts/PoblacionDatosParte2.sql  (era un duplicado
                 parcial: reinsertaba categorías, productos, unidades y lotes, con
                 los acentos ya corrompidos por estar guardado en ISO-8859-1)

   Correcciones respecto al original:
     [1] Codificación UTF-8 real. El original tenía "Caf� Org�nico".
     [2] Se eliminó el duplicado de PoblacionDatosParte2.sql.
     [3] Se eliminó "USE DB_SISGAPO" (no permitido en Azure SQL).
     [4] Se ampliaron los datos para que la demo se vea poblada:
         5 zonas, 7 usuarios, 5 almacenes, 4 categorías, 12 productos.
     [5] Catálogo ampliado a 7 categorías y 25 productos.
     [6] Imágenes de zona recortadas a 3:2.

   ADVERTENCIA: las contraseñas se insertan en texto plano porque así lo espera
   USP_MNT_Login en su forma actual. Son credenciales de demostración públicas.
   No usar este esquema con datos reales. Ver 09-mejoras-propuestas.md §M-01.

   Ejecutar después de 01-esquema.sql.
   Este script no borra nada; ejecutar antes 01-esquema.sql.
   ============================================================================ */

SET NOCOUNT ON;
GO

/* ---------------------------- CATÁLOGOS ---------------------------- */

INSERT INTO TBL_DOCUMENTO (sNombreDoc) VALUES
    ('DNI'),
    ('Carnet de Extranjería'),
    ('Pasaporte');
GO

INSERT INTO TBL_ROL (sNombreRol) VALUES
    ('Administrador'),
    ('Supervisor'),
    ('Asistente');
GO

-- h=400&fit=crop mantiene todas las imágenes en proporción 3:2.
INSERT INTO TBL_ZONA (sNombre, sRutaImagen) VALUES
    ('Junín',     'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&h=400&fit=crop'),
    ('Áncash',    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&h=400&fit=crop'),
    ('Lima',      'https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=600&h=400&fit=crop'),
    ('Cusco',     'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&h=400&fit=crop'),
    ('San Martín','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop');
GO

/* ---------------------------- USUARIOS ---------------------------- */
-- nRol: 1 = Administrador, 2 = Supervisor, 3 = Asistente
-- Los supervisores (nRol = 2) son los únicos elegibles como responsables de almacén.

INSERT INTO TBL_USUARIO
    (sNombres, sApellidos, nTipoDoc, sNumDoc, sSexo, nRol, sDireccion, nTelefono, dFechaNacimiento, bEstado)
VALUES
    ('Administrador', 'del Sistema', 1, '80808080', 'M', 1, 'Av. Principal 100, Lima',  989898989, '1990-01-01', 1),
    ('Jose',    'M',     1, '70809586', 'M', 2, 'Calle Salaverry 101, Junín', 912654789, '1996-06-06', 1),
    ('Alex',    'Quispe Cruz',       1, '70807080', 'M', 2, 'Calle Salaverry 1, Junín', 987654321, '1997-05-07', 1),
    ('María',   'Ramírez Soto',      1, '45129876', 'F', 2, 'Jr. Huaylas 220, Áncash',  912345678, '1992-11-23', 1),
    ('Carlos',  'Mendoza Ríos',      1, '41235678', 'M', 2, 'Av. Cusco 450, Cusco',     998877665, '1988-03-15', 1),
    ('Lucía',   'Fernández Paz',     1, '46781234', 'F', 3, 'Jr. Amazonas 78, Lima',    955443322, '1999-07-30', 1),
    ('Jorge',   'Salazar Vega',      2, 'CE998877', 'M', 3, 'Av. Tarapoto 12, Moyobamba', 944556677, '1995-02-18', 0);
GO

-- Credenciales de demostración. Contraseña de todos: 123456
INSERT INTO TBL_LOGIN (nIdUsuario, sNombreUsuario, sContrasenia) VALUES
    (1, 'admin',           '123456'),
    (2, 'jose.m',          '123456'),
    (3, 'alex.quispe',     '123456'),
    (4, 'maria.ramirez',   '123456'),
    (5, 'carlos.mendoza',  '123456'),
    (6, 'lucia.fernandez', '123456'),
    (7, 'jorge.salazar',   '123456');
GO

/* ---------------------------- ALMACENES ---------------------------- */

-- nIdSupervisor apunta a TBL_USUARIO y solo admite usuarios con nRol = 2.
INSERT INTO TBL_ALMACEN (sNombre, sDireccion, nIdSupervisor, nIdZona, bEstado) VALUES
    ('Almacén Central Satipo',  'Av. Marginal 101, Satipo',      2, 1, 1),
    ('Almacén Norte Huaraz',    'Jr. Huaylas 101, Huaraz',       3, 2, 1),
    ('Almacén Lima Callao',     'Av. Argentina 3200, Callao',    4, 3, 1),
    ('Almacén Cusco Valle',     'Carretera Urubamba km 12',      5, 4, 1),
    ('Almacén Tarapoto',        'Jr. Lima 550, Tarapoto',        5, 5, 0);
GO

/* ---------------------------- INVENTARIO ---------------------------- */

-- Los ids 1..4 se conservan; la categoría 4 sigue inactiva.
INSERT INTO TBL_CATEGORIA (sNombre, sDescripcion, bEstado) VALUES
    ('Café Orgánico',         'Café producido sin el uso de sustancias químicas artificiales', 1),
    ('Frutos Secos',          'Productos con menos de un 50 % de agua en su composición natural', 1),
    ('Cacao Orgánico',        'Cacao fino de aroma cultivado bajo certificación orgánica', 1),
    ('Superalimentos',        'Productos andinos de alto valor nutricional — línea descontinuada', 0),
    ('Granos Andinos',        'Quinua, kiwicha y cañihua de cultivo orgánico certificado', 1),
    ('Miel y Endulzantes',    'Miel, panela y siropes naturales sin refinar ni blanquear', 1),
    ('Infusiones y Especias', 'Hierbas aromáticas, filtrantes y especias orgánicas', 1);
GO

INSERT INTO TBL_UNIDADMEDIDA (sNombre) VALUES
    ('Kilogramos'),
    ('Gramos'),
    ('Unidad'),
    ('Paquete'),
    ('Saco 50 kg');
GO

-- El orden fija los ids 1..25 usados por los bloques siguientes.
INSERT INTO TBL_PRODUCTO (sNombre, bEstado) VALUES
    ('Café Orgánico Tostado Medio — Selva Central',    1),
    ('Café Orgánico Tostado Oscuro — Chanchamayo',     1),
    ('Café Orgánico en Grano — Villa Rica',            1),
    ('Café Molido Premium — Satipo',                   1),
    ('Nueces Pecanas Activadas',                       1),
    ('Almendras Orgánicas Tostadas',                   1),
    ('Mix Andino de Frutos Secos',                     1),
    ('Castañas Amazónicas de Madre de Dios',           1),
    ('Cacao en Grano Fino de Aroma',                   1),
    ('Nibs de Cacao Orgánico',                         1),
    ('Cacao en Polvo Orgánico',                        1),
    ('Chocolate Orgánico 70 % — Tableta 90 g',         1),
    ('Quinua Orgánica Perlada Blanca',                 1),
    ('Quinua Orgánica Tricolor',                       1),
    ('Kiwicha Orgánica — Callejón de Huaylas',         1),
    ('Miel de Abeja Multifloral — Norte Chico',        1),
    ('Panela Granulada Orgánica',                      1),
    ('Sirope de Yacón Orgánico',                       1),
    ('Manzanilla Orgánica en Filtrantes',              1),
    ('Muña Andina Deshidratada',                       1),
    ('Vainilla Orgánica en Vaina — Quillabamba',       1),
    ('Harina de Maca Negra',                           0),
    ('Polvo de Camu Camu Orgánico',                    0),
    ('Chips Artesanales de Kale',                      0),
    ('Hierba Luisa Orgánica Deshidratada',             0);
GO

-- Fechas relativas: 2 lotes activos vencen en 30 días y 6 en 90 días.
-- DECLARE e INSERT deben quedar en el mismo lote; GO elimina @dHoy.
DECLARE @dHoy DATE = CAST(GETDATE() AS DATE);

INSERT INTO TBL_LOTE (sNombreLote, dFechaFab, dFechaVenc) VALUES
    ('CAF0001', DATEADD(MONTH,  -5, @dHoy), DATEADD(MONTH,   7, @dHoy)),
    ('CAF0002', DATEADD(MONTH,  -4, @dHoy), DATEADD(MONTH,   8, @dHoy)),
    ('CAF0003', DATEADD(MONTH,  -6, @dHoy), DATEADD(MONTH,  12, @dHoy)),
    ('CAF0004', DATEADD(MONTH,  -3, @dHoy), DATEADD(MONTH,   9, @dHoy)),
    ('FRU0001', DATEADD(MONTH, -11, @dHoy), DATEADD(DAY,     9, @dHoy)),
    ('FRU0002', DATEADD(MONTH,  -9, @dHoy), DATEADD(DAY,    88, @dHoy)),
    ('FRU0003', DATEADD(MONTH, -10, @dHoy), DATEADD(DAY,    47, @dHoy)),
    ('FRU0004', DATEADD(MONTH,  -5, @dHoy), DATEADD(MONTH,   6, @dHoy)),
    ('CAC0001', DATEADD(MONTH,  -7, @dHoy), DATEADD(MONTH,  11, @dHoy)),
    ('CAC0002', DATEADD(MONTH, -10, @dHoy), DATEADD(DAY,    78, @dHoy)),
    ('CAC0003', DATEADD(MONTH,  -6, @dHoy), DATEADD(MONTH,  10, @dHoy)),
    ('CAC0004', DATEADD(MONTH,  -4, @dHoy), DATEADD(MONTH,  14, @dHoy)),
    ('GRA0001', DATEADD(MONTH,  -8, @dHoy), DATEADD(MONTH,  16, @dHoy)),
    ('GRA0002', DATEADD(MONTH,  -7, @dHoy), DATEADD(MONTH,  17, @dHoy)),
    ('GRA0003', DATEADD(MONTH,  -9, @dHoy), DATEADD(MONTH,  15, @dHoy)),
    ('MIE0001', DATEADD(MONTH,  -6, @dHoy), DATEADD(MONTH,  18, @dHoy)),
    ('MIE0002', DATEADD(MONTH,  -5, @dHoy), DATEADD(MONTH,  13, @dHoy)),
    ('MIE0003', DATEADD(MONTH,  -4, @dHoy), DATEADD(MONTH,  12, @dHoy)),
    ('INF0001', DATEADD(MONTH, -18, @dHoy), DATEADD(DAY,    63, @dHoy)),
    ('INF0002', DATEADD(MONTH, -11, @dHoy), DATEADD(DAY,    22, @dHoy)),
    ('INF0003', DATEADD(MONTH,  -9, @dHoy), DATEADD(MONTH,  15, @dHoy)),
    ('SUP0001', DATEADD(MONTH, -25, @dHoy), DATEADD(DAY,   -31, @dHoy)),
    ('SUP0002', DATEADD(MONTH, -24, @dHoy), DATEADD(DAY,   -12, @dHoy)),
    ('FRU0005', DATEADD(MONTH, -14, @dHoy), DATEADD(DAY,   -58, @dHoy)),
    ('INF0004', DATEADD(MONTH, -20, @dHoy), DATEADD(DAY,    -5, @dHoy));
GO

-- nIdUnidadMedida: 1 kg, 2 g, 3 unidad, 4 paquete, 5 saco de 50 kg.
INSERT INTO TBL_DET_PRODUCTO
    (nIdProducto, sDescripcion, nIdUnidadMedida, nCantidad, nPrecio, nIdLote)
VALUES
    ( 1, 'Tueste medio de acidez equilibrada y notas florales, a granel',        1,  120,  38,  1),
    ( 2, 'Tostado a mano en lotes pequeños, cuerpo intenso y final achocolatado',1,   95,  42,  2),
    ( 3, 'Café verde de altura listo para exportación, saco de 50 kg',           5,    5, 950,  3),
    ( 4, 'Paquete de 500 g con molienda fina para prensa francesa',              4,  160,  25,  4),
    ( 5, 'Remojadas y deshidratadas a baja temperatura para activar la semilla', 1,   55,  55,  5),
    ( 6, 'Tostadas sin sal añadida ni aceites agregados',                        1,   70,  48,  6),
    ( 7, 'Paquete de 500 g con nueces, almendras, pasas y arándanos orgánicos',  4,  130,  32,  7),
    ( 8, 'Castaña pelada de recolección silvestre certificada',                  1,   40,  62,  8),
    ( 9, 'Grano fermentado y secado al sol, origen San Martín, saco de 50 kg',   5,    6, 780,  9),
    (10, 'Paquete de 200 g de trozos de cacao tostado sin azúcar añadida',       4,  150,  16, 10),
    (11, 'Prensado en frío y molido fino, sin alcalinizar',                      1,   60,  34, 11),
    (12, 'Tableta artesanal de 90 g elaborada con cacao criollo',                3,  380,  12, 12),
    (13, 'Lavada y perlada, lista para consumo, origen Puno',                    1,  200,  14, 13),
    (14, 'Mezcla de quinua blanca, roja y negra en saco de 50 kg',               5,    5, 800, 14),
    (15, 'Grano seleccionado de siembra orgánica en Áncash',                     1,  120,  11, 15),
    (16, 'Frasco de 1 kg de miel cruda sin pasteurizar',                         3,  220,  22, 16),
    (17, 'Jugo de caña deshidratado, sin refinar ni blanquear',                  1,  300,   9, 17),
    (18, 'Frasco de 250 ml de endulzante natural de bajo índice glucémico',      3,  180,  24, 18),
    (19, 'Caja de 25 filtrantes de manzanilla de cultivo orgánico',              4,  240,   8, 19),
    (20, 'Hoja entera secada a la sombra, aroma mentolado, origen Cusco',        1,   45,  26, 20),
    (21, 'Vaina curada de vainilla amazónica, precio por gramo',                 2, 1200,   2, 21),
    (22, 'Maca negra gelatinizada y pulverizada, origen Junín',                  1,   60,  30, 22),
    (23, 'Pulpa atomizada de alto contenido de vitamina C',                      1,   45,  44, 23),
    (24, 'Paquete de 100 g deshidratado a baja temperatura',                     4,   90,  18, 24),
    (25, 'Hoja secada a la sombra para infusión, origen San Martín',             1,   30,  20, 25);
GO

-- Ningún producto activo apunta al almacén 5 ni a la categoría 4, ambos inactivos.
INSERT INTO TBL_CAT_PROD (nIdAlmacen, nIdCategoria, nIdProducto) VALUES
    (1, 1,  1),
    (1, 1,  2),
    (3, 1,  3),
    (1, 1,  4),
    (3, 2,  5),
    (3, 2,  6),
    (3, 2,  7),
    (3, 2,  8),
    (1, 3,  9),
    (1, 3, 10),
    (1, 3, 11),
    (3, 3, 12),
    (2, 5, 13),
    (4, 5, 14),
    (2, 5, 15),
    (2, 6, 16),
    (2, 6, 17),
    (4, 6, 18),
    (2, 7, 19),
    (4, 7, 20),
    (4, 7, 21),
    (1, 4, 22),
    (5, 4, 23),
    (3, 2, 24),
    (5, 7, 25);
GO

/* ---------------------------- VERIFICACIÓN ---------------------------- */
-- Debe devolver: 3, 3, 5, 7, 7, 5, 7, 5, 25, 25, 25, 25
SELECT 'TBL_DOCUMENTO' AS tabla, COUNT(*) AS filas FROM TBL_DOCUMENTO
UNION ALL SELECT 'TBL_ROL',            COUNT(*) FROM TBL_ROL
UNION ALL SELECT 'TBL_ZONA',           COUNT(*) FROM TBL_ZONA
UNION ALL SELECT 'TBL_USUARIO',        COUNT(*) FROM TBL_USUARIO
UNION ALL SELECT 'TBL_LOGIN',          COUNT(*) FROM TBL_LOGIN
UNION ALL SELECT 'TBL_ALMACEN',        COUNT(*) FROM TBL_ALMACEN
UNION ALL SELECT 'TBL_CATEGORIA',      COUNT(*) FROM TBL_CATEGORIA
UNION ALL SELECT 'TBL_UNIDADMEDIDA',   COUNT(*) FROM TBL_UNIDADMEDIDA
UNION ALL SELECT 'TBL_PRODUCTO',       COUNT(*) FROM TBL_PRODUCTO
UNION ALL SELECT 'TBL_LOTE',           COUNT(*) FROM TBL_LOTE
UNION ALL SELECT 'TBL_DET_PRODUCTO',   COUNT(*) FROM TBL_DET_PRODUCTO
UNION ALL SELECT 'TBL_CAT_PROD',       COUNT(*) FROM TBL_CAT_PROD;
GO

-- Valores esperados documentados en README.md.
SELECT 'Valor del inventario activo' AS invariante,
       SUM(d.nCantidad * d.nPrecio) AS valor
  FROM TBL_DET_PRODUCTO d
  JOIN TBL_PRODUCTO p ON p.nIdProducto = d.nIdProducto
 WHERE p.bEstado = 1
UNION ALL SELECT 'Productos activos', COUNT(*) FROM TBL_PRODUCTO WHERE bEstado = 1
UNION ALL SELECT 'Productos dados de baja', COUNT(*) FROM TBL_PRODUCTO WHERE bEstado = 0
UNION ALL SELECT 'Lotes activos que vencen en 30 días', COUNT(*)
  FROM TBL_DET_PRODUCTO d
  JOIN TBL_PRODUCTO p ON p.nIdProducto = d.nIdProducto
  JOIN TBL_LOTE     l ON l.nIdLote     = d.nIdLote
 WHERE p.bEstado = 1
   AND l.dFechaVenc BETWEEN CAST(GETDATE() AS DATE) AND DATEADD(DAY, 30, CAST(GETDATE() AS DATE))
UNION ALL SELECT 'Lotes activos que vencen en 90 días', COUNT(*)
  FROM TBL_DET_PRODUCTO d
  JOIN TBL_PRODUCTO p ON p.nIdProducto = d.nIdProducto
  JOIN TBL_LOTE     l ON l.nIdLote     = d.nIdLote
 WHERE p.bEstado = 1
   AND l.dFechaVenc BETWEEN CAST(GETDATE() AS DATE) AND DATEADD(DAY, 90, CAST(GETDATE() AS DATE))
UNION ALL SELECT 'Lotes activos ya vencidos', COUNT(*)
  FROM TBL_DET_PRODUCTO d
  JOIN TBL_PRODUCTO p ON p.nIdProducto = d.nIdProducto
  JOIN TBL_LOTE     l ON l.nIdLote     = d.nIdLote
 WHERE p.bEstado = 1 AND l.dFechaVenc < CAST(GETDATE() AS DATE)
UNION ALL SELECT 'Productos de baja sin lote vencido', COUNT(*)
  FROM TBL_DET_PRODUCTO d
  JOIN TBL_PRODUCTO p ON p.nIdProducto = d.nIdProducto
  JOIN TBL_LOTE     l ON l.nIdLote     = d.nIdLote
 WHERE p.bEstado = 0 AND l.dFechaVenc >= CAST(GETDATE() AS DATE)
UNION ALL SELECT 'Productos activos en almacén o categoría de baja', COUNT(*)
  FROM TBL_CAT_PROD cp
  JOIN TBL_PRODUCTO  p ON p.nIdProducto  = cp.nIdProducto
  JOIN TBL_ALMACEN   a ON a.nIdAlmacen   = cp.nIdAlmacen
  JOIN TBL_CATEGORIA c ON c.nIdCategoria = cp.nIdCategoria
 WHERE p.bEstado = 1 AND (a.bEstado = 0 OR c.bEstado = 0);
GO
