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

			SELECT 
				nIdCatProd,
				Alm.nIdAlmacen,
				Alm.sNombre AS 'sNombreAlmacen',
				Cat.nIdCategoria,
				Cat.sNombre AS 'sNombreCategoria',
				Prod.nIdProducto,
				Prod.sNombre AS 'sNombreProducto',
				DetProd.nIdDetProd,
				DetProd.nCantidad,
				UM.sNombre AS 'sNombreUM',
				DetProd.nPrecio,
				Lot.sNombreLote,
				Lot.dFechaVenc,
				IIF(Prod.bEstado=1,'Activo', 'Inactivo') AS 'sEstado'
			FROM TBL_CAT_PROD Tbl
			INNER JOIN TBL_ALMACEN		Alm		ON Alm.nIdAlmacen	= Tbl.nIdAlmacen
			INNER JOIN TBL_CATEGORIA	Cat		ON Cat.nIdCategoria	= Tbl.nIdCategoria
			INNER JOIN TBL_PRODUCTO		Prod	ON Prod.nIdProducto	= Tbl.nIdProducto
			INNER JOIN TBL_DET_PRODUCTO DetProd ON DetProd.nIdProducto = Prod.nIdProducto
			INNER JOIN TBL_LOTE			Lot		ON Lot.nIdLote	= DetProd.nIdLote
			INNER JOIN TBL_UNIDADMEDIDA UM		ON UM.nIdUnidadMedida	= DetProd.nIdUnidadMedida
			WHERE
				(@nIdAlmacen   = 0 OR Tbl.nIdAlmacen   = @nIdAlmacen)
				AND (@nIdCategoria = 0 OR Tbl.nIdCategoria = @nIdCategoria)
			ORDER BY
				Prod.bEstado DESC, Lot.dFechaVenc

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

			--[FIX] Faltaban sDescripcion y nIdLote, y las fechas salian con el formato
			--      regional del servidor. El modal de edicion no podia precargarlas:
			--      la descripcion y los dos datepicker quedaban vacios. Ver 06-hallazgos.
			SELECT 
				nIdCatProd,
				Alm.nIdAlmacen,				
				Cat.nIdCategoria,				
				Prod.nIdProducto,
        Prod.sNombre AS 'sNombreProducto',
				DetProd.nIdDetProd,
				DetProd.nCantidad,
				UM.nIdUnidadMedida,
				DetProd.nPrecio,
				DetProd.sDescripcion,
				Lot.nIdLote,
				CONVERT(VARCHAR(10), Lot.dFechaFab,  23) AS 'dFechaFab',
				CONVERT(VARCHAR(10), Lot.dFechaVenc, 23) AS 'dFechaVenc'
			FROM TBL_CAT_PROD Tbl
			INNER JOIN TBL_ALMACEN		Alm		ON Alm.nIdAlmacen	= Tbl.nIdAlmacen
			INNER JOIN TBL_CATEGORIA	Cat		ON Cat.nIdCategoria	= Tbl.nIdCategoria
			INNER JOIN TBL_PRODUCTO		Prod	ON Prod.nIdProducto	= Tbl.nIdProducto
			INNER JOIN TBL_DET_PRODUCTO DetProd ON DetProd.nIdProducto = Prod.nIdProducto
			INNER JOIN TBL_LOTE			Lot		ON Lot.nIdLote	= DetProd.nIdLote
			INNER JOIN TBL_UNIDADMEDIDA UM		ON UM.nIdUnidadMedida	= DetProd.nIdUnidadMedida
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


			SET @nContador = (SELECT COUNT(*) FROM TBL_PRODUCTO WHERE sNombre = @sNombreProducto)
			SET @sNombreLote = CONCAT(LEFT(@sNombreProducto,3),RIGHT(CONCAT('0000',@nContador),4))

			INSERT INTO TBL_LOTE
					  (sNombreLote,  dFechaFab,  dFechaVenc)
			VALUES(@sNombreLote, @dFechaFab, @dFechaVenc)

			SET @nIdLote = SCOPE_IDENTITY()

			INSERT INTO TBL_DET_PRODUCTO
					  ( nIdProducto, sDescripcion, nIdUnidadMedida, nCantidad, nPrecio, nIdLote)
			VALUES( @nIdProducto, @sDescripcion, @nIdUnidadMedida, @nCantidad, @nPrecioUnitario, @nIdLote)

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
      SET @nIdUnidadMedida	= (SELECT valor FROM @tParametro WHERE id = 4);
      SET @nCantidad	      = (SELECT valor FROM @tParametro WHERE id = 5);
      SET @nPrecioUnitario	= (SELECT valor FROM @tParametro WHERE id = 6);
      SET @dFechaFab	      = (SELECT valor FROM @tParametro WHERE id = 7);
      SET @dFechaVenc	      = (SELECT valor FROM @tParametro WHERE id = 8);
			SET @sDescripcion		  = (SELECT valor FROM @tParametro WHERE id = 9);
      SET @nIdProducto		  = (SELECT valor FROM @tParametro WHERE id = 10);
      SET @nIdCatProd		    = (SELECT valor FROM @tParametro WHERE id = 11);

      --[FIX] @nIdLote no llega en pParametro y nunca se asignaba, asi que el
      --      UPDATE de TBL_LOTE corria con WHERE nIdLote = NULL y no afectaba a
      --      ninguna fila: cambiar la fecha de vencimiento no hacia nada.
      SET @nIdLote = (SELECT TOP 1 nIdLote FROM TBL_DET_PRODUCTO WHERE nIdProducto = @nIdProducto);
		END	
		--[FIX] Los cuatro UPDATE van en una transaccion, por el mismo motivo que la
		--      opcion 06: antes podian quedar a medias sin que nadie se enterara.
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

			--
			UPDATE [TBL_LOTE]
				SET
				dFechaFab       = @dFechaFab,
				dFechaVenc      = @dFechaVenc
			WHERE
				nIdLote = @nIdLote

			--
			UPDATE [TBL_DET_PRODUCTO]
				SET
				sDescripcion    = @sDescripcion,
				nIdUnidadMedida = @nIdUnidadMedida,
				nCantidad       = @nCantidad,
				nPrecio         = @nPrecioUnitario
			WHERE
				nIdProducto = @nIdProducto

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
