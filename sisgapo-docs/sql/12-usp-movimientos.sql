GO
/****** Object:  StoredProcedure [dbo].[USP_MNT_Movimientos] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*  Movimientos y kardex — entradas, salidas y ajustes sobre un lote.

    Módulo nuevo. El documento de casos de uso decía que el cliente "no cuenta con
    reportes automatizados para conocer los ingresos y salidas", pero el modelo de
    2021 no lo soportaba: la existencia era un nCantidad que se sobrescribía al
    editar el producto, sin dejar constancia de quién ni por qué.
    Ver 09-mejoras-propuestas.md, M-12.

    Reglas:
      - La existencia de un lote solo cambia aquí. TBL_DET_PRODUCTO.nCantidad es
        el saldo vigente y TBL_MOVIMIENTO guarda cómo se llegó a él.
      - nCantidad lleva el signo: la entrada suma, la salida resta y el ajuste
        puede ir en los dos sentidos.
      - Una salida nunca puede dejar el lote en negativo.
      - El ajuste recibe la cantidad contada en el inventario físico, no la
        diferencia: el procedimiento calcula el delta.

    Opciones:
      01  Kardex                    @pParametro = nIdAlmacen|nIdProducto|nIdDetProd|sTipo|dDesde|dHasta
      02  Registrar movimiento      @pParametro = nIdDetProd|sTipo|nCantidad|sMotivo|nIdUsuario
      03  Listar lotes del combo    @pParametro = nIdAlmacen|nIdProducto
      04  Totales del kardex        @pParametro = los mismos seis filtros de la opción 01
*/
CREATE OR ALTER PROCEDURE [dbo].[USP_MNT_Movimientos]

    @sOpcion    VARCHAR(2) = '',
    @pParametro VARCHAR(MAX) = ''

AS

BEGIN

    BEGIN

        DECLARE @nIdAlmacen  INT;
        DECLARE @nIdProducto INT;
        DECLARE @nIdDetProd  INT;
        DECLARE @nIdUsuario  INT;
        DECLARE @nCantidad   INT;
        DECLARE @nSaldo      INT;
        DECLARE @nMovimiento INT;
        DECLARE @bEstado     BIT;
        DECLARE @sTipo       VARCHAR(1);
        DECLARE @sMotivo     VARCHAR(300);
        DECLARE @dDesde      DATE;
        DECLARE @dHasta      DATE;

    END

    --VARIABLE TABLA
    BEGIN

        DECLARE @tParametro TABLE (
            id int,
            valor varchar(max)
        );

    END

    --Descontena el parametro con split
    BEGIN
        IF(LEN(LTRIM(RTRIM(@pParametro))) > 0)
            BEGIN
                INSERT INTO @tParametro (id, valor) SELECT id, valor FROM dbo.Split(@pParametro, '|');
            END;
    END;


    IF @sOpcion = '01' OR @sOpcion = '04'   --KARDEX Y SUS TOTALES
    BEGIN

        BEGIN
            --0, vacío o '' = sin filtro, igual que en el resto de pantallas.
            SET @nIdAlmacen  = ISNULL(NULLIF((SELECT valor FROM @tParametro WHERE id = 1), ''), 0);
            SET @nIdProducto = ISNULL(NULLIF((SELECT valor FROM @tParametro WHERE id = 2), ''), 0);
            SET @nIdDetProd  = ISNULL(NULLIF((SELECT valor FROM @tParametro WHERE id = 3), ''), 0);
            SET @sTipo       = ISNULL(NULLIF((SELECT valor FROM @tParametro WHERE id = 4), ''), '');
            SET @dDesde      = NULLIF((SELECT valor FROM @tParametro WHERE id = 5), '');
            SET @dHasta      = NULLIF((SELECT valor FROM @tParametro WHERE id = 6), '');
        END

        IF @sOpcion = '01'
        BEGIN

            --TOP 500: el kardex crece sin límite y la tabla del navegador no. Con
            --los filtros de la pantalla nunca se llega a ese tope.
            SELECT TOP 500
                mov.nIdMovimiento,
                mov.nIdDetProd,
                CONVERT(VARCHAR(16), mov.dFechaMov, 120) AS 'dFechaMov',
                mov.sTipo,
                CASE mov.sTipo WHEN 'E' THEN 'Entrada'
                               WHEN 'S' THEN 'Salida'
                               ELSE 'Ajuste' END AS 'sTipoNombre',
                IIF(mov.nCantidad > 0,  mov.nCantidad, 0) AS 'nEntrada',
                IIF(mov.nCantidad < 0, -mov.nCantidad, 0) AS 'nSalida',
                mov.nSaldo,
                ISNULL(mov.sMotivo, '') AS 'sMotivo',
                CONCAT(usr.sNombres, ' ', usr.sApellidos) AS 'sNombrePersona',
                lot.sNombreLote,
                prod.sNombre AS 'sNombreProducto',
                alm.sNombre  AS 'sNombreAlmacen',
                um.sNombre   AS 'sNombreUM'
            FROM TBL_MOVIMIENTO mov
            INNER JOIN TBL_DET_PRODUCTO det  ON det.nIdDetProd      = mov.nIdDetProd
            INNER JOIN TBL_PRODUCTO     prod ON prod.nIdProducto    = det.nIdProducto
            INNER JOIN TBL_LOTE         lot  ON lot.nIdLote         = det.nIdLote
            INNER JOIN TBL_UNIDADMEDIDA um   ON um.nIdUnidadMedida  = det.nIdUnidadMedida
            INNER JOIN TBL_USUARIO      usr  ON usr.nIdUsuario      = mov.nIdUsuario
            INNER JOIN TBL_CAT_PROD     cp   ON cp.nIdProducto      = prod.nIdProducto
            INNER JOIN TBL_ALMACEN      alm  ON alm.nIdAlmacen      = cp.nIdAlmacen
            WHERE
                (@nIdAlmacen  = 0 OR cp.nIdAlmacen     = @nIdAlmacen)
                AND (@nIdProducto = 0 OR prod.nIdProducto  = @nIdProducto)
                AND (@nIdDetProd  = 0 OR mov.nIdDetProd    = @nIdDetProd)
                AND (@sTipo       = '' OR mov.sTipo        = @sTipo)
                AND (@dDesde IS NULL OR mov.dFechaMov >= @dDesde)
                AND (@dHasta IS NULL OR mov.dFechaMov <  DATEADD(DAY, 1, @dHasta))
            ORDER BY
                mov.dFechaMov DESC, mov.nIdMovimiento DESC;

        END

        ELSE
        BEGIN

            SELECT
                COUNT(*) AS 'nMovimientos',
                ISNULL(SUM(IIF(mov.nCantidad > 0,  mov.nCantidad, 0)), 0) AS 'nEntradas',
                ISNULL(SUM(IIF(mov.nCantidad < 0, -mov.nCantidad, 0)), 0) AS 'nSalidas',
                ISNULL(SUM(IIF(mov.sTipo = 'A', 1, 0)), 0) AS 'nAjustes'
            FROM TBL_MOVIMIENTO mov
            INNER JOIN TBL_DET_PRODUCTO det  ON det.nIdDetProd   = mov.nIdDetProd
            INNER JOIN TBL_PRODUCTO     prod ON prod.nIdProducto = det.nIdProducto
            INNER JOIN TBL_CAT_PROD     cp   ON cp.nIdProducto   = prod.nIdProducto
            WHERE
                (@nIdAlmacen  = 0 OR cp.nIdAlmacen     = @nIdAlmacen)
                AND (@nIdProducto = 0 OR prod.nIdProducto  = @nIdProducto)
                AND (@nIdDetProd  = 0 OR mov.nIdDetProd    = @nIdDetProd)
                AND (@sTipo       = '' OR mov.sTipo        = @sTipo)
                AND (@dDesde IS NULL OR mov.dFechaMov >= @dDesde)
                AND (@dHasta IS NULL OR mov.dFechaMov <  DATEADD(DAY, 1, @dHasta));

        END

    END;


    ELSE IF @sOpcion = '02'   --REGISTRAR MOVIMIENTO
    BEGIN

        BEGIN
            SET @nIdDetProd = (SELECT valor FROM @tParametro WHERE id = 1);
            SET @sTipo      = UPPER(LTRIM(RTRIM(ISNULL((SELECT valor FROM @tParametro WHERE id = 2), ''))));
            SET @nCantidad  = (SELECT valor FROM @tParametro WHERE id = 3);
            SET @sMotivo    = LTRIM(RTRIM(ISNULL((SELECT valor FROM @tParametro WHERE id = 4), '')));
            --El id del usuario lo añade el controlador desde el token: quien firma
            --el movimiento es quien inició sesión, no lo que mande el formulario.
            SET @nIdUsuario = (SELECT valor FROM @tParametro WHERE id = 5);
        END

        IF @sTipo NOT IN ('E', 'S', 'A')
        BEGIN
            SELECT '0|Tipo de movimiento no válido'
            RETURN;
        END

        IF @sMotivo = ''
        BEGIN
            SELECT '0|El motivo es obligatorio'
            RETURN;
        END

        IF @nCantidad IS NULL OR @nCantidad < 0
        BEGIN
            SELECT '0|La cantidad no puede ser negativa'
            RETURN;
        END

        IF @sTipo <> 'A' AND @nCantidad = 0
        BEGIN
            SELECT '0|La cantidad debe ser mayor que cero'
            RETURN;
        END

        BEGIN TRY

            BEGIN TRANSACTION;

            --UPDLOCK: si dos personas mueven el mismo lote a la vez, la segunda
            --espera y lee el saldo ya actualizado en vez de pisarlo.
            SELECT
                @nSaldo  = det.nCantidad,
                @bEstado = det.bEstado
            FROM TBL_DET_PRODUCTO det WITH (UPDLOCK)
            WHERE det.nIdDetProd = @nIdDetProd;

            IF @nSaldo IS NULL
            BEGIN
                ROLLBACK TRANSACTION;
                SELECT '0|El lote no existe'
                RETURN;
            END

            IF @bEstado = 0
            BEGIN
                ROLLBACK TRANSACTION;
                SELECT '0|El lote está dado de baja'
                RETURN;
            END

            --El ajuste recibe la cantidad contada; la diferencia la calcula el
            --procedimiento para que el kardex la muestre como entrada o salida.
            IF @sTipo = 'A'
            BEGIN
                SET @nMovimiento = @nCantidad - @nSaldo;

                IF @nMovimiento = 0
                BEGIN
                    ROLLBACK TRANSACTION;
                    SELECT '0|La cantidad contada coincide con la existencia: no hay ajuste que registrar'
                    RETURN;
                END
            END
            ELSE IF @sTipo = 'E'
            BEGIN
                SET @nMovimiento = @nCantidad;
            END
            ELSE
            BEGIN
                SET @nMovimiento = -@nCantidad;

                IF @nCantidad > @nSaldo
                BEGIN
                    ROLLBACK TRANSACTION;
                    SELECT CONCAT('0|El lote solo tiene ', @nSaldo, ' en existencia')
                    RETURN;
                END
            END

            SET @nSaldo = @nSaldo + @nMovimiento;

            INSERT INTO TBL_MOVIMIENTO
                  (nIdDetProd,  sTipo, nCantidad,    nSaldo,  sMotivo,  nIdUsuario)
            VALUES(@nIdDetProd, @sTipo, @nMovimiento, @nSaldo, @sMotivo, @nIdUsuario)

            UPDATE [TBL_DET_PRODUCTO]
                SET nCantidad = @nSaldo
            WHERE
                nIdDetProd = @nIdDetProd

            COMMIT TRANSACTION;

            SELECT CONCAT('1|Se registró el movimiento. Saldo del lote: ', @nSaldo)

        END TRY
        BEGIN CATCH

            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT CONCAT('0|No se pudo registrar el movimiento: ', ERROR_MESSAGE())

        END CATCH

    END;


    ELSE IF @sOpcion = '03'   --LISTAR LOTES DEL COMBO
    BEGIN

        BEGIN
            SET @nIdAlmacen  = ISNULL(NULLIF((SELECT valor FROM @tParametro WHERE id = 1), ''), 0);
            SET @nIdProducto = ISNULL(NULLIF((SELECT valor FROM @tParametro WHERE id = 2), ''), 0);
        END

        --Solo lotes activos de productos activos: sobre el resto no se puede mover
        --nada, así que no tiene sentido ofrecerlos.
        SELECT
            det.nIdDetProd,
            lot.sNombreLote,
            prod.nIdProducto,
            prod.sNombre AS 'sNombreProducto',
            alm.nIdAlmacen,
            alm.sNombre  AS 'sNombreAlmacen',
            det.nCantidad,
            um.sNombre   AS 'sNombreUM',
            ISNULL(CONVERT(VARCHAR(10), lot.dFechaVenc, 23), '') AS 'dFechaVenc'
        FROM TBL_DET_PRODUCTO det
        INNER JOIN TBL_PRODUCTO     prod ON prod.nIdProducto   = det.nIdProducto
        INNER JOIN TBL_LOTE         lot  ON lot.nIdLote        = det.nIdLote
        INNER JOIN TBL_UNIDADMEDIDA um   ON um.nIdUnidadMedida = det.nIdUnidadMedida
        INNER JOIN TBL_CAT_PROD     cp   ON cp.nIdProducto     = prod.nIdProducto
        INNER JOIN TBL_ALMACEN      alm  ON alm.nIdAlmacen     = cp.nIdAlmacen
        WHERE
            det.bEstado = 1
            AND prod.bEstado = 1
            AND (@nIdAlmacen  = 0 OR cp.nIdAlmacen    = @nIdAlmacen)
            AND (@nIdProducto = 0 OR prod.nIdProducto = @nIdProducto)
        ORDER BY
            prod.sNombre, lot.dFechaVenc;

    END;

END;
