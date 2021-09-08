USE [DB_SISGAPO]
GO
                                   
CREATE PROCEDURE [dbo].[USP_MNT_Categorias]          
            
	@sOpcion VARCHAR(2) = '',   
	@pParametro VARCHAR(max)
                                                                                   
AS


BEGIN

	BEGIN
		
		DECLARE @nIdCategoria INT;				
		DECLARE @nIdUsuario	INT;			
		DECLARE @bEstado	  BIT;
		DECLARE @sNombre	  VARCHAR(MAX);
		DECLARE @sDescripcion VARCHAR(MAX);
 
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
        
		
	IF @sOpcion = '01'   --CONSULTAR CATEGORÍAS
	BEGIN
			
			SELECT
        nIdCategoria,
        sNombre,
        sDescripcion,
        IIF(bEstado=1,'Activo', 'Inactivo') AS 'sEstado'
      FROM [TBL_CATEGORIA]
                                                                                 
	END;                                     


	ELSE IF @sOpcion = '02'  --CONSULTAR POR ID                                                   
	BEGIN
		BEGIN
			SET @nIdCategoria	= (SELECT valor FROM @tParametro WHERE id = 1);	
		END	
		
		BEGIN
			SELECT 
				*
			FROM [TBL_CATEGORIA] 
			WHERE 
				nIdCategoria=@nIdCategoria

		END
	END;


	ELSE IF @sOpcion = '03'  --INSERTAR CATEGORÍAS
	BEGIN
		BEGIN

			SET @sNombre		  = (SELECT valor FROM @tParametro WHERE id = 1);
			SET @sDescripcion		= (SELECT valor FROM @tParametro WHERE id = 2);
			
		END	

		BEGIN
			IF((SELECT COUNT(*) FROM TBL_CATEGORIA)<1)
			BEGIN
				INSERT INTO [TBL_CATEGORIA]
						(sNombre,  sDescripcion, bEstado)
				VALUES(@sNombre, @sDescripcion,  1)

				SELECT '1|Se registró con éxito'
			END
			ELSE
			BEGIN
				SELECT '0|Categoría ya registrada'
			END
			
      		
		END
		
	END
	   
	   
	ELSE IF @sOpcion = '04'  -- EDITAR CATEGORÍAS
	BEGIN
		BEGIN
			SET @sNombre	  = (SELECT valor FROM @tParametro WHERE id = 1);
			SET @sDescripcion = (SELECT valor FROM @tParametro WHERE id = 2);
			SET @nIdCategoria = (SELECT valor FROM @tParametro WHERE id = 3);
		END	
                              
			UPDATE [TBL_CATEGORIA]                           
				SET 
				sNombre       = @sNombre,
				sDescripcion    = @sDescripcion
			WHERE 
				nIdCategoria = @nIdCategoria                   

			SELECT '1|Se actualizó con éxito'
        
	END;                            

                                                           
	ELSE IF @sOpcion = '05'  -- ELIMINAR/ACTIVAR
	BEGIN  
		BEGIN
			SET @nIdCategoria	= (SELECT valor FROM @tParametro WHERE id = 1);	
			SET @bEstado	  = (SELECT valor FROM @tParametro WHERE id = 2);	
		END	
        
		BEGIN
		
			--Eliminacion Logica
			UPDATE [TBL_CATEGORIA]
				SET	 bEstado = @bEstado
			WHERE nIdCategoria = @nIdCategoria
        END

      SELECT CONCAT('1|',IIF(@bEstado=1,'Se activó con éxito', 'Se eliminó con éxito'))
        
	END;                                                        
                                       	 
	
END
