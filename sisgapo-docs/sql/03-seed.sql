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
         5 zonas, 6 usuarios, 5 almacenes, 4 categorías, 12 productos.

   ADVERTENCIA: las contraseñas se insertan en texto plano porque así lo espera
   USP_MNT_Login en su forma actual. Son credenciales de demostración públicas.
   No usar este esquema con datos reales. Ver 09-mejoras-propuestas.md §M-01.

   Ejecutar después de 01-esquema.sql.
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
    ('Administrador'),   -- nIdRol = 1
    ('Supervisor'),      -- nIdRol = 2
    ('Asistente');       -- nIdRol = 3
GO

INSERT INTO TBL_ZONA (sNombre, sRutaImagen) VALUES
    ('Junín',     'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600'),
    ('Áncash',    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600'),
    ('Lima',      'https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=600'),
    ('Cusco',     'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600'),
    ('San Martín','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600');
GO

/* ---------------------------- USUARIOS ---------------------------- */
-- nRol: 1 = Administrador, 2 = Supervisor, 3 = Asistente
-- Los supervisores (nRol = 2) son los únicos elegibles como responsables de almacén.

INSERT INTO TBL_USUARIO
    (sNombres, sApellidos, nTipoDoc, sNumDoc, sSexo, nRol, sDireccion, nTelefono, dFechaNacimiento, bEstado)
VALUES
    ('Administrador', 'del Sistema', 1, '80808080', 'M', 1, 'Av. Principal 100, Lima',  989898989, '1990-01-01', 1),
    ('Alex',    'Quispe Cruz',       1, '70807080', 'M', 2, 'Calle Salaverry 1, Junín', 987654321, '1997-05-07', 1),
    ('María',   'Ramírez Soto',      1, '45129876', 'F', 2, 'Jr. Huaylas 220, Áncash',  912345678, '1992-11-23', 1),
    ('Carlos',  'Mendoza Ríos',      1, '41235678', 'M', 2, 'Av. Cusco 450, Cusco',     998877665, '1988-03-15', 1),
    ('Lucía',   'Fernández Paz',     1, '46781234', 'F', 3, 'Jr. Amazonas 78, Lima',    955443322, '1999-07-30', 1),
    ('Jorge',   'Salazar Vega',      2, 'CE998877', 'M', 3, 'Av. Tarapoto 12, Moyobamba', 944556677, '1995-02-18', 0);  -- inactivo, para probar el filtro
GO

-- Credenciales de demostración. Contraseña de todos: 123456
INSERT INTO TBL_LOGIN (nIdUsuario, sNombreUsuario, sContrasenia) VALUES
    (1, 'admin',           '123456'),
    (2, 'alex.quispe',     '123456'),
    (3, 'maria.ramirez',   '123456'),
    (4, 'carlos.mendoza',  '123456'),
    (5, 'lucia.fernandez', '123456'),
    (6, 'jorge.salazar',   '123456');
GO

/* ---------------------------- ALMACENES ---------------------------- */

INSERT INTO TBL_ALMACEN (sNombre, sDireccion, nIdSupervisor, nIdZona, bEstado) VALUES
    ('Almacén Central Satipo',  'Av. Marginal 101, Satipo',      2, 1, 1),
    ('Almacén Norte Huaraz',    'Jr. Huaylas 101, Huaraz',       3, 2, 1),
    ('Almacén Lima Callao',     'Av. Argentina 3200, Callao',    3, 3, 1),
    ('Almacén Cusco Valle',     'Carretera Urubamba km 12',      4, 4, 1),
    ('Almacén Tarapoto',        'Jr. Lima 550, Tarapoto',        4, 5, 0);  -- inactivo
GO

/* ---------------------------- INVENTARIO ---------------------------- */

INSERT INTO TBL_CATEGORIA (sNombre, sDescripcion, bEstado) VALUES
    ('Café Orgánico',  'Café producido sin el uso de sustancias químicas artificiales', 1),
    ('Frutos Secos',   'Productos con menos de un 50 % de agua en su composición natural', 1),
    ('Cacao Orgánico', 'Cacao fino de aroma cultivado bajo certificación orgánica', 1),
    ('Superalimentos', 'Productos andinos de alto valor nutricional', 0);   -- inactiva
GO

INSERT INTO TBL_UNIDADMEDIDA (sNombre) VALUES
    ('Kilogramos'),
    ('Gramos'),
    ('Unidad'),
    ('Paquete'),
    ('Saco 50 kg');
GO

INSERT INTO TBL_PRODUCTO (sNombre, bEstado) VALUES
    ('Café Orgánico Tostado Medio — Selva Central',   1),
    ('Café Orgánico Tostado Oscuro — Chanchamayo',    1),
    ('Café Orgánico en Grano — Villa Rica',           1),
    ('Café Molido Premium — Satipo',                  1),
    ('Nueces Pecanas Activadas',                      1),
    ('Almendras Orgánicas Tostadas',                  1),
    ('Chips Artesanales de Kale',                     1),
    ('Mix Andino de Frutos Secos',                    1),
    ('Cacao en Grano Fino de Aroma',                  1),
    ('Nibs de Cacao Orgánico',                        1),
    ('Harina de Maca Negra',                          0),   -- dado de baja
    ('Quinua Orgánica Perlada',                       0);   -- dado de baja
GO

-- Fechas relativas a la fecha de carga, no fijas.
-- Con fechas fijas la demo envejece: unos meses despues de escribir el seed,
-- todo el inventario aparece vencido y el panel de inicio se ve roto. Asi el
-- escenario es siempre el mismo se cargue cuando se cargue:
--   * dos lotes activos vencen dentro de los proximos 30 dias -> alimentan la
--     alerta del panel sin que nada llegue a estar caducado,
--   * el resto se reparte entre 2 y 14 meses,
--   * los dos lotes de productos dados de baja si estan vencidos, que es
--     justamente el motivo verosimil de la baja.
DECLARE @dHoy DATE = CAST(GETDATE() AS DATE);

INSERT INTO TBL_LOTE (sNombreLote, dFechaFab, dFechaVenc) VALUES
    ('CAF0001', DATEADD(MONTH,  -7, @dHoy), DATEADD(MONTH,   5, @dHoy)),
    ('CAF0002', DATEADD(MONTH,  -6, @dHoy), DATEADD(MONTH,   6, @dHoy)),
    ('CAF0003', DATEADD(MONTH,  -6, @dHoy), DATEADD(MONTH,   7, @dHoy)),
    ('CAF0004', DATEADD(MONTH,  -5, @dHoy), DATEADD(MONTH,   8, @dHoy)),
    ('FRU0001', DATEADD(MONTH,  -8, @dHoy), DATEADD(DAY,    12, @dHoy)),   -- por vencer
    ('FRU0002', DATEADD(MONTH,  -7, @dHoy), DATEADD(DAY,    26, @dHoy)),   -- por vencer
    ('FRU0003', DATEADD(MONTH,  -6, @dHoy), DATEADD(MONTH,   3, @dHoy)),
    ('FRU0004', DATEADD(MONTH,  -5, @dHoy), DATEADD(MONTH,   4, @dHoy)),
    ('CAC0001', DATEADD(MONTH,  -7, @dHoy), DATEADD(MONTH,  11, @dHoy)),
    ('CAC0002', DATEADD(MONTH,  -6, @dHoy), DATEADD(MONTH,  14, @dHoy)),
    ('SUP0001', DATEADD(MONTH, -13, @dHoy), DATEADD(DAY,   -20, @dHoy)),   -- vencido, dado de baja
    ('SUP0002', DATEADD(MONTH, -12, @dHoy), DATEADD(DAY,    -5, @dHoy));   -- vencido, dado de baja
GO

-- nIdUnidadMedida: 1 Kilogramos, 2 Gramos, 3 Unidad, 4 Paquete, 5 Saco 50 kg
INSERT INTO TBL_DET_PRODUCTO
    (nIdProducto, sDescripcion, nIdUnidadMedida, nCantidad, nPrecio, nIdLote)
VALUES
    ( 1, 'Mezcla equilibrada de acidez y cuerpo, con notas florales',   1, 250, 38,  1),
    ( 2, 'Granos tostados a mano en lotes pequeños',                    1, 180, 42,  2),
    ( 3, 'Café peruano de altura, fragante y de final suave',           5,  40, 950, 3),
    ( 4, 'Molienda fina para prensa francesa',                          4, 320, 25,  4),
    ( 5, 'Activadas para despertar la vitalidad enzimática de la semilla', 1, 90, 55, 5),
    ( 6, 'Tostadas sin sal añadida',                                    1, 120, 48,  6),
    ( 7, 'Deshidratados a baja temperatura',                            4, 200, 18,  7),
    ( 8, 'Mezcla de nueces, almendras y pasas orgánicas',               4, 150, 32,  8),
    ( 9, 'Grano fermentado y secado al sol, origen San Martín',         5,  25, 780, 9),
    (10, 'Trozos de cacao puro sin azúcar añadida',                     2, 400, 22, 10),
    (11, 'Maca negra pulverizada de Junín',                             2, 100, 30, 11),
    (12, 'Quinua lavada y perlada de Puno',                             1,  60, 28, 12);
GO

-- Distribución de productos por almacén y categoría
-- Categorías: 1 Café, 2 Frutos Secos, 3 Cacao, 4 Superalimentos
INSERT INTO TBL_CAT_PROD (nIdAlmacen, nIdCategoria, nIdProducto) VALUES
    (1, 1,  1),
    (1, 1,  2),
    (2, 1,  3),
    (1, 1,  4),
    (1, 2,  5),
    (2, 2,  6),
    (3, 2,  7),
    (3, 2,  8),
    (4, 3,  9),
    (4, 3, 10),
    (2, 4, 11),
    (3, 4, 12);
GO

/* ---------------------------- VERIFICACIÓN ---------------------------- */
-- Debe devolver: 3, 3, 5, 6, 6, 5, 4, 5, 12, 12, 12, 12
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
