GO
/****** Object:  StoredProcedure [dbo].[USP_MNT_Panel] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*  Panel de inicio — consultas de agregación.

    Módulo nuevo (no estaba en el alcance de 2021). El documento de casos de uso
    menciona los reportes como necesidad explícita del cliente —"no cuenta con
    reportes automatizados para conocer los ingresos y salidas"— pero ningún CUS
    los especifica y la pantalla de inicio quedó literalmente vacía
    (inicio.component.html: 0 bytes).

    Son consultas de solo lectura sobre el modelo existente: no cambia ninguna
    tabla. Sigue el mismo contrato que el resto: @sOpcion + @pParametro.

    Desde que un producto puede tener varios lotes, todas las consultas descartan
    los lotes dados de baja (TBL_DET_PRODUCTO.bEstado = 0); las agregaciones ya
    sumaban por producto, así que no hubo que rehacerlas.

    Opciones:
      01  Tarjetas de resumen (una fila con los totales)
      02  Existencias por almacén
      03  Existencias por categoría
      04  Productos próximos a vencer   @pParametro = días (por defecto 90)
*/
CREATE OR ALTER PROCEDURE [dbo].[USP_MNT_Panel]

    @sOpcion    VARCHAR(2) = '',
    @pParametro VARCHAR(MAX) = ''

AS

BEGIN

    DECLARE @nDias INT;

    IF @sOpcion = '01'   --TARJETAS DE RESUMEN
    BEGIN

        SELECT
            (SELECT COUNT(*) FROM TBL_ALMACEN  WHERE bEstado = 1) AS 'nAlmacenes',
            (SELECT COUNT(*) FROM TBL_PRODUCTO WHERE bEstado = 1) AS 'nProductos',
            (SELECT COUNT(*) FROM TBL_CATEGORIA WHERE bEstado = 1) AS 'nCategorias',
            (SELECT COUNT(*) FROM TBL_ZONA     WHERE bEstado = 1) AS 'nZonas',

            --Valor del inventario: cantidad por precio unitario sobre los
            --productos activos.
            ISNULL((SELECT SUM(CAST(d.nCantidad AS BIGINT) * d.nPrecio)
                      FROM TBL_DET_PRODUCTO d
                      INNER JOIN TBL_PRODUCTO p ON p.nIdProducto = d.nIdProducto
                     WHERE p.bEstado = 1 AND d.bEstado = 1), 0) AS 'nValorInventario',

            --Unidades totales en existencia
            ISNULL((SELECT SUM(d.nCantidad)
                      FROM TBL_DET_PRODUCTO d
                      INNER JOIN TBL_PRODUCTO p ON p.nIdProducto = d.nIdProducto
                     WHERE p.bEstado = 1 AND d.bEstado = 1), 0) AS 'nUnidades',

            --Lo que de verdad importa en un almacén de productos orgánicos
            (SELECT COUNT(*)
               FROM TBL_DET_PRODUCTO d
               INNER JOIN TBL_PRODUCTO p ON p.nIdProducto = d.nIdProducto
               INNER JOIN TBL_LOTE     l ON l.nIdLote     = d.nIdLote
              WHERE p.bEstado = 1 AND d.bEstado = 1
                AND l.dFechaVenc <= DATEADD(DAY, 30, CAST(GETDATE() AS DATE))) AS 'nPorVencer30',

            (SELECT COUNT(*)
               FROM TBL_DET_PRODUCTO d
               INNER JOIN TBL_PRODUCTO p ON p.nIdProducto = d.nIdProducto
               INNER JOIN TBL_LOTE     l ON l.nIdLote     = d.nIdLote
              WHERE p.bEstado = 1 AND d.bEstado = 1
                AND l.dFechaVenc < CAST(GETDATE() AS DATE)) AS 'nVencidos';

    END;


    ELSE IF @sOpcion = '02'   --EXISTENCIAS POR ALMACÉN
    BEGIN

        SELECT
            a.nIdAlmacen,
            a.sNombre AS 'sNombreAlmacen',
            z.sNombre AS 'sNombreZona',
            COUNT(DISTINCT p.nIdProducto) AS 'nProductos',
            ISNULL(SUM(d.nCantidad), 0) AS 'nUnidades',
            ISNULL(SUM(CAST(d.nCantidad AS BIGINT) * d.nPrecio), 0) AS 'nValor'
        FROM TBL_ALMACEN a
        INNER JOIN TBL_ZONA z ON z.nIdZona = a.nIdZona
        LEFT  JOIN TBL_CAT_PROD     cp ON cp.nIdAlmacen  = a.nIdAlmacen
        LEFT  JOIN TBL_PRODUCTO     p  ON p.nIdProducto  = cp.nIdProducto AND p.bEstado = 1
        LEFT  JOIN TBL_DET_PRODUCTO d  ON d.nIdProducto  = p.nIdProducto AND d.bEstado = 1
        WHERE
            a.bEstado = 1
        GROUP BY
            a.nIdAlmacen, a.sNombre, z.sNombre
        ORDER BY
            ISNULL(SUM(CAST(d.nCantidad AS BIGINT) * d.nPrecio), 0) DESC, a.sNombre;

    END;


    ELSE IF @sOpcion = '03'   --EXISTENCIAS POR CATEGORÍA
    BEGIN

        SELECT
            c.nIdCategoria,
            c.sNombre AS 'sNombreCategoria',
            COUNT(DISTINCT p.nIdProducto) AS 'nProductos',
            ISNULL(SUM(d.nCantidad), 0) AS 'nUnidades',
            ISNULL(SUM(CAST(d.nCantidad AS BIGINT) * d.nPrecio), 0) AS 'nValor'
        FROM TBL_CATEGORIA c
        LEFT JOIN TBL_CAT_PROD     cp ON cp.nIdCategoria = c.nIdCategoria
        LEFT JOIN TBL_PRODUCTO     p  ON p.nIdProducto   = cp.nIdProducto AND p.bEstado = 1
        LEFT JOIN TBL_DET_PRODUCTO d  ON d.nIdProducto   = p.nIdProducto AND d.bEstado = 1
        WHERE
            c.bEstado = 1
        GROUP BY
            c.nIdCategoria, c.sNombre
        ORDER BY
            c.sNombre;

    END;


    ELSE IF @sOpcion = '04'   --PRÓXIMOS A VENCER
    BEGIN

        --Por defecto 90 días. El parámetro llega como texto, igual que en el
        --resto de procedimientos.
        SET @nDias = ISNULL(NULLIF(LTRIM(RTRIM(@pParametro)), ''), 90);

        SELECT TOP 20
            cp.nIdCatProd,
            p.nIdProducto,
            p.sNombre  AS 'sNombreProducto',
            a.sNombre  AS 'sNombreAlmacen',
            c.sNombre  AS 'sNombreCategoria',
            l.sNombreLote,
            CONVERT(VARCHAR(10), l.dFechaVenc, 23) AS 'dFechaVenc',
            DATEDIFF(DAY, CAST(GETDATE() AS DATE), l.dFechaVenc) AS 'nDiasRestantes',
            d.nCantidad,
            um.sNombre AS 'sNombreUM'
        FROM TBL_CAT_PROD cp
        INNER JOIN TBL_PRODUCTO     p  ON p.nIdProducto     = cp.nIdProducto
        INNER JOIN TBL_ALMACEN      a  ON a.nIdAlmacen      = cp.nIdAlmacen
        INNER JOIN TBL_CATEGORIA    c  ON c.nIdCategoria    = cp.nIdCategoria
        INNER JOIN TBL_DET_PRODUCTO d  ON d.nIdProducto     = p.nIdProducto
        INNER JOIN TBL_LOTE         l  ON l.nIdLote         = d.nIdLote
        INNER JOIN TBL_UNIDADMEDIDA um ON um.nIdUnidadMedida = d.nIdUnidadMedida
        WHERE
            p.bEstado = 1
            AND d.bEstado = 1
            AND l.dFechaVenc <= DATEADD(DAY, @nDias, CAST(GETDATE() AS DATE))
        ORDER BY
            l.dFechaVenc;

    END;

END;
