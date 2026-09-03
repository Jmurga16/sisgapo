GO
/****** Object:  StoredProcedure [dbo].[USP_MNT_Lotes] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*  Lotes — mantenimiento de las partidas de un producto.

    Módulo nuevo. Hasta ahora TBL_DET_PRODUCTO tenía una fila por producto y esa
    fila apuntaba a un solo lote, así que un producto no podía tener dos partidas
    con vencimientos distintos: justo el caso de uso central de un almacén de
    productos orgánicos. Ver 09-mejoras-propuestas.md, M-09.

    A partir de aquí TBL_DET_PRODUCTO tiene una fila por producto Y lote. Este
    procedimiento mantiene esas filas; la existencia no se toca desde aquí, la
    mueve USP_MNT_Movimientos.

    Sigue el contrato del resto: @sOpcion + @pParametro delimitado por '|'.

    Opciones:
      01  Listar lotes                @pParametro = nIdAlmacen|nIdCategoria|nIdProducto
      02  Lote por id                 @pParametro = nIdDetProd
      03  Insertar lote               @pParametro = 9 campos (ver más abajo)
      04  Editar lote                 @pParametro = 7 campos
      05  Activar / desactivar lote   @pParametro = nIdDetProd|bEstado
      06  Listar productos del combo  @pParametro = nIdAlmacen
*/
CREATE OR ALTER PROCEDURE [dbo].[USP_MNT_Lotes]

    @sOpcion    VARCHAR(2) = '',
    @pParametro VARCHAR(MAX) = ''

AS

BEGIN

    BEGIN

        DECLARE @nIdAlmacen      INT;
        DECLARE @nIdCategoria    INT;
        DECLARE @nIdProducto     INT;
        DECLARE @nIdDetProd      INT;
        DECLARE @nIdLote         INT;
        DECLARE @nIdUnidadMedida INT;
        DECLARE @nIdUsuario      INT;
        DECLARE @nCantidad       INT;
        DECLARE @nPrecio         INT;
        DECLARE @nContador       INT;
        DECLARE @bEstado         BIT;
        DECLARE @sNombreLote     VARCHAR(100);
        DECLARE @sNombreProducto VARCHAR(300);
        DECLARE @sDescripcion    VARCHAR(500);
        DECLARE @dFechaFab       DATE;
        DECLARE @dFechaVenc      DATE;

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


    IF @sOpcion = '01'   --LISTAR LOTES
    BEGIN

        BEGIN
            --0 o vacío = todos, igual que los filtros de Productos.
            SET @nIdAlmacen   = ISNULL(NULLIF((SELECT valor FROM @tParametro WHERE id = 1), ''), 0);
            SET @nIdCategoria = ISNULL(NULLIF((SELECT valor FROM @tParametro WHERE id = 2), ''), 0);
            SET @nIdProducto  = ISNULL(NULLIF((SELECT valor FROM @tParametro WHERE id = 3), ''), 0);
        END

        SELECT
            det.nIdDetProd,
            prod.nIdProducto,
            prod.sNombre  AS 'sNombreProducto',
            alm.nIdAlmacen,
            alm.sNombre   AS 'sNombreAlmacen',
            cat.nIdCategoria,
            cat.sNombre   AS 'sNombreCategoria',
            lot.nIdLote,
            lot.sNombreLote,
            ISNULL(CONVERT(VARCHAR(10), lot.dFechaFab,  23), '') AS 'dFechaFab',
            ISNULL(CONVERT(VARCHAR(10), lot.dFechaVenc, 23), '') AS 'dFechaVenc',
            ISNULL(DATEDIFF(DAY, CAST(GETDATE() AS DATE), lot.dFechaVenc), 0) AS 'nDiasRestantes',
            det.nCantidad,
            um.sNombre    AS 'sNombreUM',
            det.nPrecio,
            IIF(det.bEstado = 1, 'Activo', 'Inactivo') AS 'sEstado'
        FROM TBL_DET_PRODUCTO det
        INNER JOIN TBL_PRODUCTO      prod ON prod.nIdProducto   = det.nIdProducto
        INNER JOIN TBL_LOTE          lot  ON lot.nIdLote        = det.nIdLote
        INNER JOIN TBL_UNIDADMEDIDA  um   ON um.nIdUnidadMedida = det.nIdUnidadMedida
        INNER JOIN TBL_CAT_PROD      cp   ON cp.nIdProducto     = prod.nIdProducto
        INNER JOIN TBL_ALMACEN       alm  ON alm.nIdAlmacen     = cp.nIdAlmacen
        INNER JOIN TBL_CATEGORIA     cat  ON cat.nIdCategoria   = cp.nIdCategoria
        WHERE
            (@nIdAlmacen   = 0 OR cp.nIdAlmacen     = @nIdAlmacen)
            AND (@nIdCategoria = 0 OR cp.nIdCategoria   = @nIdCategoria)
            AND (@nIdProducto  = 0 OR prod.nIdProducto  = @nIdProducto)
        ORDER BY
            det.bEstado DESC, lot.dFechaVenc, lot.sNombreLote;

    END;


    ELSE IF @sOpcion = '02'   --LOTE POR ID
    BEGIN

        BEGIN
            SET @nIdDetProd = (SELECT valor FROM @tParametro WHERE id = 1);
        END

        SELECT
            det.nIdDetProd,
            prod.nIdProducto,
            prod.sNombre AS 'sNombreProducto',
            lot.nIdLote,
            lot.sNombreLote,
            ISNULL(CONVERT(VARCHAR(10), lot.dFechaFab,  23), '') AS 'dFechaFab',
            ISNULL(CONVERT(VARCHAR(10), lot.dFechaVenc, 23), '') AS 'dFechaVenc',
            det.nIdUnidadMedida,
            det.nCantidad,
            det.nPrecio,
            ISNULL(det.sDescripcion, '') AS 'sDescripcion',
            det.bEstado
        FROM TBL_DET_PRODUCTO det
        INNER JOIN TBL_PRODUCTO prod ON prod.nIdProducto = det.nIdProducto
        INNER JOIN TBL_LOTE     lot  ON lot.nIdLote      = det.nIdLote
        WHERE
            det.nIdDetProd = @nIdDetProd;

    END;


    ELSE IF @sOpcion = '03'   --INSERTAR LOTE
    BEGIN

        BEGIN
            SET @nIdProducto     = (SELECT valor FROM @tParametro WHERE id = 1);
            SET @sNombreLote     = LTRIM(RTRIM(ISNULL((SELECT valor FROM @tParametro WHERE id = 2), '')));
            SET @dFechaFab       = NULLIF((SELECT valor FROM @tParametro WHERE id = 3), '');
            SET @dFechaVenc      = NULLIF((SELECT valor FROM @tParametro WHERE id = 4), '');
            SET @nIdUnidadMedida = (SELECT valor FROM @tParametro WHERE id = 5);
            SET @nCantidad       = (SELECT valor FROM @tParametro WHERE id = 6);
            SET @nPrecio         = (SELECT valor FROM @tParametro WHERE id = 7);
            SET @sDescripcion    = (SELECT valor FROM @tParametro WHERE id = 8);
            --El id del usuario lo añade el controlador desde el token.
            SET @nIdUsuario      = (SELECT valor FROM @tParametro WHERE id = 9);
        END

        SET @sNombreProducto = (SELECT sNombre FROM TBL_PRODUCTO WHERE nIdProducto = @nIdProducto AND bEstado = 1);

        IF @sNombreProducto IS NULL
        BEGIN
            SELECT '0|El producto no existe o está dado de baja'
            RETURN;
        END

        --El listado de Productos suma la existencia de todos los lotes y muestra
        --una sola U.M.; mezclar kilos, paquetes o unidades haría ese total falso.
        IF EXISTS (
            SELECT 1
            FROM TBL_DET_PRODUCTO
            WHERE nIdProducto = @nIdProducto
              AND nIdUnidadMedida <> @nIdUnidadMedida
        )
        BEGIN
            SELECT '0|La unidad de medida debe coincidir con los demás lotes del producto'
            RETURN;
        END

        IF @nCantidad < 0
        BEGIN
            SELECT '0|La cantidad inicial no puede ser negativa'
            RETURN;
        END

        IF @dFechaFab IS NOT NULL AND @dFechaVenc IS NOT NULL AND @dFechaVenc <= @dFechaFab
        BEGIN
            SELECT '0|La fecha de vencimiento debe ser posterior a la de fabricación'
            RETURN;
        END

        --Si no llega código, se genera con el mismo criterio que USP_MNT_Productos:
        --tres letras del producto más el primer correlativo libre.
        IF @sNombreLote = ''
        BEGIN
            SET @nContador = 1;
            SET @sNombreLote = CONCAT(UPPER(LEFT(@sNombreProducto, 3)), RIGHT(CONCAT('0000', @nContador), 4));

            WHILE EXISTS (SELECT 1 FROM TBL_LOTE WHERE sNombreLote = @sNombreLote)
            BEGIN
                SET @nContador = @nContador + 1;
                SET @sNombreLote = CONCAT(UPPER(LEFT(@sNombreProducto, 3)), RIGHT(CONCAT('0000', @nContador), 4));
            END
        END
        ELSE IF EXISTS (SELECT 1 FROM TBL_LOTE WHERE sNombreLote = @sNombreLote)
        BEGIN
            SELECT CONCAT('0|Ya existe un lote con el código ', @sNombreLote)
            RETURN;
        END

        BEGIN TRY

            BEGIN TRANSACTION;

            INSERT INTO TBL_LOTE
                  (sNombreLote,  dFechaFab,  dFechaVenc)
            VALUES(@sNombreLote, @dFechaFab, @dFechaVenc)

            SET @nIdLote = SCOPE_IDENTITY()

            INSERT INTO TBL_DET_PRODUCTO
                  (nIdProducto,  sDescripcion,  nIdUnidadMedida,  nCantidad,  nPrecio, nIdLote,  bEstado)
            VALUES(@nIdProducto, @sDescripcion, @nIdUnidadMedida, @nCantidad, @nPrecio, @nIdLote, 1)

            SET @nIdDetProd = SCOPE_IDENTITY()

            --La existencia inicial entra al kardex como una entrada más.
            IF @nCantidad > 0
            BEGIN
                INSERT INTO TBL_MOVIMIENTO
                      (nIdDetProd,  sTipo, nCantidad,  nSaldo,     sMotivo,         nIdUsuario)
                VALUES(@nIdDetProd, 'E',   @nCantidad, @nCantidad, 'Alta del lote', @nIdUsuario)
            END

            COMMIT TRANSACTION;

            SELECT CONCAT('1|Se registró el lote ', @sNombreLote)

        END TRY
        BEGIN CATCH

            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT CONCAT('0|No se pudo registrar el lote: ', ERROR_MESSAGE())

        END CATCH

    END;


    ELSE IF @sOpcion = '04'   --EDITAR LOTE
    BEGIN

        BEGIN
            SET @nIdDetProd      = (SELECT valor FROM @tParametro WHERE id = 1);
            SET @sNombreLote     = LTRIM(RTRIM(ISNULL((SELECT valor FROM @tParametro WHERE id = 2), '')));
            SET @dFechaFab       = NULLIF((SELECT valor FROM @tParametro WHERE id = 3), '');
            SET @dFechaVenc      = NULLIF((SELECT valor FROM @tParametro WHERE id = 4), '');
            SET @nIdUnidadMedida = (SELECT valor FROM @tParametro WHERE id = 5);
            SET @nPrecio         = (SELECT valor FROM @tParametro WHERE id = 6);
            SET @sDescripcion    = (SELECT valor FROM @tParametro WHERE id = 7);
        END

        SELECT
            @nIdLote = nIdLote,
            @nIdProducto = nIdProducto
        FROM TBL_DET_PRODUCTO
        WHERE nIdDetProd = @nIdDetProd;

        IF @nIdLote IS NULL
        BEGIN
            SELECT '0|El lote no existe'
            RETURN;
        END

        IF @sNombreLote = ''
        BEGIN
            SELECT '0|El código del lote es obligatorio'
            RETURN;
        END

        IF EXISTS (
            SELECT 1
            FROM TBL_DET_PRODUCTO
            WHERE nIdProducto = @nIdProducto
              AND nIdDetProd <> @nIdDetProd
              AND nIdUnidadMedida <> @nIdUnidadMedida
        )
        BEGIN
            SELECT '0|La unidad de medida debe coincidir con los demás lotes del producto'
            RETURN;
        END

        IF @dFechaFab IS NOT NULL AND @dFechaVenc IS NOT NULL AND @dFechaVenc <= @dFechaFab
        BEGIN
            SELECT '0|La fecha de vencimiento debe ser posterior a la de fabricación'
            RETURN;
        END

        IF EXISTS (SELECT 1 FROM TBL_LOTE WHERE sNombreLote = @sNombreLote AND nIdLote <> @nIdLote)
        BEGIN
            SELECT CONCAT('0|Ya existe un lote con el código ', @sNombreLote)
            RETURN;
        END

        --La cantidad no está aquí a propósito: se mueve con USP_MNT_Movimientos,
        --que es lo que deja constancia de quién la cambió y por qué.
        BEGIN TRY

            BEGIN TRANSACTION;

            UPDATE [TBL_LOTE]
                SET
                sNombreLote = @sNombreLote,
                dFechaFab   = @dFechaFab,
                dFechaVenc  = @dFechaVenc
            WHERE
                nIdLote = @nIdLote

            UPDATE [TBL_DET_PRODUCTO]
                SET
                sDescripcion    = @sDescripcion,
                nIdUnidadMedida = @nIdUnidadMedida,
                nPrecio         = @nPrecio
            WHERE
                nIdDetProd = @nIdDetProd

            COMMIT TRANSACTION;

            SELECT '1|Se actualizó el lote con éxito'

        END TRY
        BEGIN CATCH

            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            SELECT CONCAT('0|No se pudo actualizar el lote: ', ERROR_MESSAGE())

        END CATCH

    END;


    ELSE IF @sOpcion = '05'   --ACTIVAR / DESACTIVAR LOTE
    BEGIN

        BEGIN
            SET @nIdDetProd = (SELECT valor FROM @tParametro WHERE id = 1);
            SET @bEstado    = (SELECT valor FROM @tParametro WHERE id = 2);
        END

        SET @nCantidad = (SELECT nCantidad FROM TBL_DET_PRODUCTO WHERE nIdDetProd = @nIdDetProd);

        IF @nCantidad IS NULL
        BEGIN
            SELECT '0|El lote no existe'
            RETURN;
        END

        --Dar de baja un lote con existencia dejaría stock fuera del inventario sin
        --que ningún movimiento lo explique. Primero se saca la mercadería.
        IF @bEstado = 0 AND @nCantidad > 0
        BEGIN
            SELECT CONCAT('0|El lote todavía tiene ', @nCantidad, ' en existencia. Registra la salida antes de darlo de baja')
            RETURN;
        END

        UPDATE [TBL_DET_PRODUCTO]
            SET bEstado = @bEstado
        WHERE
            nIdDetProd = @nIdDetProd

        SELECT CONCAT('1|', IIF(@bEstado = 1, 'Se activó el lote con éxito', 'Se dio de baja el lote con éxito'))

    END;


    ELSE IF @sOpcion = '06'   --LISTAR PRODUCTOS DEL COMBO
    BEGIN

        BEGIN
            SET @nIdAlmacen = ISNULL(NULLIF((SELECT valor FROM @tParametro WHERE id = 1), ''), 0);
        END

        SELECT
            prod.nIdProducto,
            prod.sNombre AS 'sNombreProducto',
            alm.nIdAlmacen,
            alm.sNombre  AS 'sNombreAlmacen'
        FROM TBL_PRODUCTO prod
        INNER JOIN TBL_CAT_PROD cp  ON cp.nIdProducto = prod.nIdProducto
        INNER JOIN TBL_ALMACEN  alm ON alm.nIdAlmacen = cp.nIdAlmacen
        WHERE
            prod.bEstado = 1
            AND (@nIdAlmacen = 0 OR cp.nIdAlmacen = @nIdAlmacen)
        ORDER BY
            prod.sNombre;

    END;

END;
