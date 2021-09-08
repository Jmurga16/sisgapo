USE [DB_SISGAPO]
GO
/****** Object:  StoredProcedure [dbo].[USP_MNT_Productos]    Script Date: 18/08/2021 7:56:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
                                   
CREATE PROCEDURE [dbo].[USP_MNT_Productos]          
            
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
      --WHERE
        --Prod.bEstado = 1
      		
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
				Lot.dFechaFab,
				Lot.dFechaVenc
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

		BEGIN
         

			INSERT INTO TBL_PRODUCTO
					  (sNombre,  bEstado)
			VALUES(@sNombreProducto,  1)

      SET @nIdProducto = @@IDENTITY

      INSERT INTO TBL_CAT_PROD
					  (nIdAlmacen,  nIdCategoria,  nIdProducto)
			VALUES(@nIdAlmacen, @nIdCategoria, @nIdProducto)

      
      SET @nContador = (SELECT COUNT(*) FROM TBL_PRODUCTO WHERE sNombre = @sNombreProducto)
      SET @sNombreLote = CONCAT(LEFT(@sNombreProducto,3),RIGHT(CONCAT('0000',@nContador),4))

      INSERT INTO TBL_LOTE
					  (sNombreLote,  dFechaFab,  dFechaVenc)
			VALUES(@sNombreLote, @dFechaFab, @dFechaVenc)

      SET @nIdLote = @@IDENTITY
      
      INSERT INTO TBL_DET_PRODUCTO
					  ( nIdProducto, sDescripcion, nIdUnidadMedida, nCantidad, nPrecio, nIdLote)
			VALUES( @nIdProducto, @sDescripcion, @nIdUnidadMedida, @nCantidad, @nPrecioUnitario, @nIdLote)

      
			SELECT '1|Se registró con éxito'
      		
		END
		
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
		END	
                              
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

			SELECT '1|Se actualizó con éxito'
        
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
