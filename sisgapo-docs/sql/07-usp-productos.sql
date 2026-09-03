GO
/****** Object:  StoredProcedure [dbo].[USP_MNT_Productos]    Script Date: 18/08/2021 7:56:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
                                   
CREATE OR ALTER PROCEDURE [dbo].[USP_MNT_Productos]          
            
	@sOpcion VARCHAR(2) = '',   
	@pParametro VARCHAR(max)
                                                                                   
AS     

BEGIN

	BEGIN

    DECLARE @nIdAlmacen       INT;
		DECLARE @nIdCategoria     INT;
    DECLARE @nIdProducto      INT
		DECLARE @nIdUsuario	      INT;
    DECLARE @nIdUnidadMedida  INT;
    DECLARE @nIdLote          INT;
    DECLARE @nIdCatProd       INT;
    DECLARE @nIdDetProd       INT;
    DECLARE @nCantidad	      INT;
    DECLARE @nPrecioUnitario	INT;
    DECLARE @sNombreLote      VARCHAR(MAX);;
    DECLARE @dFechaFab        DATE;
    DECLARE @dFechaVenc       DATE;
		DECLARE @bEstado	        BIT;
		DECLARE @sNombre	        VARCHAR(MAX);
    DECLARE @sNombreProducto	VARCHAR(MAX);        
		DECLARE @sDescripcion     VARCHAR(MAX);
    DECLARE @nContador        INT;
 
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
			    INSERT INTO @tParametro (id, valor ) SELECT id, valor FROM dbo.Split(@pParametro, '|');
			END;
	END;
        
		
	IF @sOpcion = '01'   --LISTAR ALMACENES
	BEGIN
			
		SELECT 
			nIdAlmacen, 
			sNombre AS 'sNombreAlmacen'
		FROM [dbo].[TBL_ALMACEN]
		WHERE
			bEstado=1
                                                                                 
	END;                                     


	ELSE IF @sOpcion = '02'  --LISTAR CATEGORÍAS                                            
	BEGIN
		
		BEGIN
			SELECT 
				nIdCategoria, 
				sNombre AS 'sNombreCategoria'
			FROM [dbo].[TBL_CATEGORIA] 
			WHERE
				bEstado=1

		END
	END;

	ELSE IF @sOpcion = '03'  --LISTAR TABLA
	BEGIN

		BEGIN
			--[FIX] Filtros opcionales por almacen y categoria. Los dos desplegables de
			--      la pantalla de productos existian desde 2021 pero sus valores nunca
			--      llegaban a la consulta: filtrar no hacia absolutamente nada.
			--      0 o vacio = todos, igual que el filtro de rol en Usuarios.
			SET @nIdAlmacen   = ISNULL((SELECT valor FROM @tParametro WHERE id = 1), 0);
			SET @nIdCategoria = ISNULL((SELECT valor FROM @tParametro WHERE id = 2), 0);
		END

		BEGIN

			--[LOTES] Un producto ya puede tener varios lotes, así que la fila del
			--        listado deja de ser una foto de un lote y pasa a ser el resumen
			--        del producto: existencia total, número de lotes, valor y el
			--        vencimiento más próximo. El detalle por lote vive en la
			--        pantalla de Lotes (USP_MNT_Lotes).
			--        LEFT JOIN: un producto sin lotes activos sigue apareciendo, con
			--        existencia cero, en vez de desaparecer del listado.
			SELECT 
				nIdCatProd,
				Alm.nIdAlmacen,
				Alm.sNombre AS 'sNombreAlmacen',
				Cat.nIdCategoria,
				Cat.sNombre AS 'sNombreCategoria',
				Prod.nIdProducto,
				Prod.sNombre AS 'sNombreProducto',
				COUNT(DetProd.nIdDetProd) AS 'nLotes',
				ISNULL(SUM(DetProd.nCantidad), 0) AS 'nCantidad',
				ISNULL(MIN(UM.sNombre), '') AS 'sNombreUM',
				ISNULL(SUM(CAST(DetProd.nCantidad AS BIGINT) * DetProd.nPrecio), 0) AS 'nValor',
				ISNULL(CONVERT(VARCHAR(10), MIN(Lot.dFechaVenc), 23), '') AS 'dFechaVenc',
				IIF(Prod.bEstado=1,'Activo', 'Inactivo') AS 'sEstado'
			FROM TBL_CAT_PROD Tbl
			INNER JOIN TBL_ALMACEN		Alm		ON Alm.nIdAlmacen	= Tbl.nIdAlmacen
			INNER JOIN TBL_CATEGORIA	Cat		ON Cat.nIdCategoria	= Tbl.nIdCategoria
			INNER JOIN TBL_PRODUCTO		Prod	ON Prod.nIdProducto	= Tbl.nIdProducto
			LEFT  JOIN TBL_DET_PRODUCTO DetProd ON DetProd.nIdProducto = Prod.nIdProducto
											   AND DetProd.bEstado = 1
			LEFT  JOIN TBL_LOTE			Lot		ON Lot.nIdLote	= DetProd.nIdLote
			LEFT  JOIN TBL_UNIDADMEDIDA UM		ON UM.nIdUnidadMedida	= DetProd.nIdUnidadMedida
			WHERE
				(@nIdAlmacen   = 0 OR Tbl.nIdAlmacen   = @nIdAlmacen)
				AND (@nIdCategoria = 0 OR Tbl.nIdCategoria = @nIdCategoria)
			GROUP BY
				nIdCatProd, Alm.nIdAlmacen, Alm.sNombre, Cat.nIdCategoria, Cat.sNombre,
				Prod.nIdProducto, Prod.sNombre, Prod.bEstado
			ORDER BY
				Prod.bEstado DESC, MIN(Lot.dFechaVenc)

		END
		
	END

	ELSE IF @sOpcion = '04'  --LISTAR UNIDADES DE MEDIDA
	BEGIN
		
		BEGIN
			
				SELECT 
					nIdUnidadMedida, 
					sNombre AS 'sNombreUM'
				FROM [dbo].[TBL_UNIDADMEDIDA] 
				      		
		END
		
	END

  ELSE IF @sOpcion = '05'  --LISTAR PRODUCTO POR ID
	BEGIN
    BEGIN
      SET @nIdCatProd = (SELECT valor FROM @tParametro WHERE id = 1);
    END

		BEGIN

			--[LOTES] El modal de edición ya no toca cantidad, precio ni fechas: esos
			--        datos pertenecen al lote y se mantienen desde la pantalla de
			--        Lotes. Aquí solo viajan el nombre del producto y su ubicación.
			SELECT 
				nIdCatProd,
				Alm.nIdAlmacen,				
				Cat.nIdCategoria,				
				Prod.nIdProducto,
        Prod.sNombre AS 'sNombreProducto'
			FROM TBL_CAT_PROD Tbl
			INNER JOIN TBL_ALMACEN		Alm		ON Alm.nIdAlmacen	= Tbl.nIdAlmacen
			INNER JOIN TBL_CATEGORIA	Cat		ON Cat.nIdCategoria	= Tbl.nIdCategoria
			INNER JOIN TBL_PRODUCTO		Prod	ON Prod.nIdProducto	= Tbl.nIdProducto
      WHERE
        Tbl.nIdCatProd = @nIdCatProd
      		
		END
		
	END

	ELSE IF @sOpcion = '06'  --INSERTAR PRODUCTOS
	BEGIN
		BEGIN

      SET @sNombreProducto	= (SELECT valor FROM @tParametro WHERE id = 1);
      SET @nIdAlmacen	      = (SELECT valor FROM @tParametro WHERE id = 2);
      SET @nIdCategoria	    = (SELECT valor FROM @tParametro WHERE id = 3);
      SET @nIdUnidadMedida	= (SELECT valor FROM @tParametro WHERE id = 4);
      SET @nCantidad	      = (SELECT valor FROM @tParametro WHERE id = 5);
      SET @nPrecioUnitario	= (SELECT valor FROM @tParametro WHERE id = 6);
      SET @dFechaFab	      = (SELECT valor FROM @tParametro WHERE id = 7);
      SET @dFechaVenc	      = (SELECT valor FROM @tParametro WHERE id = 8);
			SET @sDescripcion		  = (SELECT valor FROM @tParametro WHERE id = 9);
      --[LOTES] El id del usuario lo añade el controlador desde el token; no
      --        llega desde el formulario. Es quien firma el movimiento de alta.
      SET @nIdUsuario		    = (SELECT valor FROM @tParametro WHERE id = 10);
         			
		END	

		--[FIX] Los cuatro INSERT van en una transaccion. Antes, si fallaba el tercero,
		--      los dos primeros quedaban confirmados y el producto se quedaba sin lote
		--      ni detalle: desaparecia del listado (INNER JOIN) sin explicacion.
		BEGIN TRY

			BEGIN TRANSACTION;

			INSERT INTO TBL_PRODUCTO
					  (sNombre,  bEstado)
			VALUES(@sNombreProducto,  1)

			SET @nIdProducto = SCOPE_IDENTITY()

			INSERT INTO TBL_CAT_PROD
					  (nIdAlmacen,  nIdCategoria,  nIdProducto)
			VALUES(@nIdAlmacen, @nIdCategoria, @nIdProducto)


			--[LOTES] El correlativo contaba productos con el mismo nombre, no lotes:
			--        dos productos distintos que empezaran igual generaban el mismo
			--        código. Ahora se busca el primer correlativo libre, igual que
			--        hace USP_MNT_Usuarios con el nombre de usuario.
			SET @nContador = 1
			SET @sNombreLote = CONCAT(UPPER(LEFT(@sNombreProducto,3)),RIGHT(CONCAT('0000',@nContador),4))

			WHILE EXISTS (SELECT 1 FROM TBL_LOTE WHERE sNombreLote = @sNombreLote)
			BEGIN
				SET @nContador = @nContador + 1
				SET @sNombreLote = CONCAT(UPPER(LEFT(@sNombreProducto,3)),RIGHT(CONCAT('0000',@nContador),4))
			END

			INSERT INTO TBL_LOTE
					  (sNombreLote,  dFechaFab,  dFechaVenc)
			VALUES(@sNombreLote, @dFechaFab, @dFechaVenc)

			SET @nIdLote = SCOPE_IDENTITY()

			INSERT INTO TBL_DET_PRODUCTO
					  ( nIdProducto, sDescripcion, nIdUnidadMedida, nCantidad, nPrecio, nIdLote, bEstado)
			VALUES( @nIdProducto, @sDescripcion, @nIdUnidadMedida, @nCantidad, @nPrecioUnitario, @nIdLote, 1)

			SET @nIdDetProd = SCOPE_IDENTITY()

			--[LOTES] La existencia inicial entra al kardex como cualquier otro
			--        movimiento. Si no, el saldo del lote no cuadraría con la suma
			--        de sus movimientos desde el primer día.
			IF @nCantidad > 0
			BEGIN
				INSERT INTO TBL_MOVIMIENTO
						  (nIdDetProd,  sTipo, nCantidad,  nSaldo,     sMotivo,                 nIdUsuario)
				VALUES(@nIdDetProd, 'E',   @nCantidad, @nCantidad, 'Alta del producto', @nIdUsuario)
			END

			COMMIT TRANSACTION;

			SELECT '1|Se registró con éxito'

		END TRY
		BEGIN CATCH

			IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
			SELECT CONCAT('0|No se pudo registrar el producto: ', ERROR_MESSAGE())

		END CATCH
		
	END
	   
	   
	ELSE IF @sOpcion = '07'  -- EDITAR PRODUCTOS
	BEGIN
		BEGIN
			SET @sNombreProducto	= (SELECT valor FROM @tParametro WHERE id = 1);
      SET @nIdAlmacen	      = (SELECT valor FROM @tParametro WHERE id = 2);
      SET @nIdCategoria	    = (SELECT valor FROM @tParametro WHERE id = 3);
      SET @nIdProducto		  = (SELECT valor FROM @tParametro WHERE id = 4);
      SET @nIdCatProd		    = (SELECT valor FROM @tParametro WHERE id = 5);
		END	

		--[LOTES] La edición se queda con lo que de verdad pertenece al producto:
		--        nombre y ubicación. Cantidad, precio y fechas eran del lote y
		--        ahora se mantienen en USP_MNT_Lotes; la existencia solo se mueve
		--        con USP_MNT_Movimientos, que deja rastro de quién y por qué.
		--        Los dos UPDATE siguen en una transacción, como la opción 06.
		BEGIN TRY

			BEGIN TRANSACTION;

			UPDATE [TBL_PRODUCTO]
				SET
				sNombre       = @sNombreProducto
			WHERE
				nIdProducto = @nIdProducto

			--
			UPDATE [TBL_CAT_PROD]
				SET
				nIdAlmacen       = @nIdAlmacen,
				nIdCategoria     = @nIdCategoria
			WHERE
				nIdCatProd = @nIdCatProd

			COMMIT TRANSACTION;

			SELECT '1|Se actualizó con éxito'

		END TRY
		BEGIN CATCH

			IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
			SELECT CONCAT('0|No se pudo actualizar el producto: ', ERROR_MESSAGE())

		END CATCH

	END;                            

                                                           
	ELSE IF @sOpcion = '08'  -- ELIMINAR/ACTIVAR
	BEGIN  
		BEGIN
			SET @nIdProducto	= (SELECT valor FROM @tParametro WHERE id = 1);	
			SET @bEstado	  = (SELECT valor FROM @tParametro WHERE id = 2);	
		END	
        
		BEGIN
		
			--Eliminacion Logica
			UPDATE [TBL_PRODUCTO]
				SET	 bEstado = @bEstado
			WHERE nIdProducto = @nIdProducto

   END

      SELECT CONCAT('1|',IIF(@bEstado=1,'Se activó con éxito', 'Se eliminó con éxito'))
        
	END;                                                        
                                       	 
	
END
