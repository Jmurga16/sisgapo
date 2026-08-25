USE [DB_SISGAPO]
GO
                                   
CREATE PROCEDURE [dbo].[USP_MNT_Clientes]          
            
	@sOpcion VARCHAR(2) = '',   
	@pParametro VARCHAR(max)
                                                                                   
AS

BEGIN

	BEGIN
		
		DECLARE @nIdCategoria INT;
		DECLARE @nIdCliente INT;
		DECLARE @nIdUsuario	INT;
		DECLARE @bEstado	  BIT;
		DECLARE @sNombre	  VARCHAR(MAX);
		DECLARE @sDescripcion VARCHAR(MAX);
    DECLARE @sEmail VARCHAR(MAX);
    DECLARE @sDireccion VARCHAR(MAX);
    DECLARE @nTelefono	INT;
    			
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
        
		
	IF @sOpcion = '01'   --CONSULTAR CLIENTES
	BEGIN
			
		SELECT
			*			
		FROM [TBL_CLIENTE]
                                                                                 
	END;                                     


	ELSE IF @sOpcion = '02'  --CONSULTAR POR ID                                                   
	BEGIN
		BEGIN
			SET @nIdCliente	= (SELECT valor FROM @tParametro WHERE id = 1);	
		END	
		
		BEGIN
			SELECT 
				*
			FROM [TBL_CLIENTE] 
			WHERE 
				nIdCliente=@nIdCliente

		END
	END;


  ELSE IF @sOpcion = '03'  --INSERTAR CLIENTES
	BEGIN
		BEGIN

			SET @sNombre		  = (SELECT valor FROM @tParametro WHERE id = 1);
			SET @sEmail			  = (SELECT valor FROM @tParametro WHERE id = 2);
			SET @nTelefono		= (SELECT valor FROM @tParametro WHERE id = 3);
			SET @sDireccion		= (SELECT valor FROM @tParametro WHERE id = 4);
			SET @sDescripcion	= (SELECT valor FROM @tParametro WHERE id = 5);
			
		END	

		BEGIN			
			BEGIN
				INSERT INTO [TBL_CLIENTE]
						(sNombre,	sEmail,  nTelefono,	 sDireccion,  sDescripcion)
				VALUES  (@sNombre,	@sEmail, @nTelefono, @sDireccion, @sDescripcion)

				SELECT '1|Se registró con éxito'
			END
						
      		
		END
		
	END
	   
	   
	ELSE IF @sOpcion = '04'  -- EDITAR CLIENTES
	BEGIN
		BEGIN
			SET @sNombre		  = (SELECT valor FROM @tParametro WHERE id = 1);
			SET @sEmail			  = (SELECT valor FROM @tParametro WHERE id = 2);
			SET @nTelefono		= (SELECT valor FROM @tParametro WHERE id = 3);
			SET @sDireccion		= (SELECT valor FROM @tParametro WHERE id = 4);
			SET @sDescripcion	= (SELECT valor FROM @tParametro WHERE id = 5);
			SET @nIdCliente   = (SELECT valor FROM @tParametro WHERE id = 6);
		END	
                              
			UPDATE [TBL_CLIENTE]                           
			SET 
				sNombre      = @sNombre,
        sEmail       = @sEmail,
        nTelefono    = @nTelefono,
        sDireccion   = @sDireccion,
				sDescripcion = @sDescripcion
			WHERE 
				nIdCliente = @nIdCliente                   

			SELECT '1|Se actualizó con éxito'
        
	END;                            
                              	 
	
END
