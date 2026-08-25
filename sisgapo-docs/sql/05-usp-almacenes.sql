GO
/****** Object:  StoredProcedure [dbo].[USP_MNT_Almacenes]    Script Date: 04/07/2021 3:44:27 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

                                   
CREATE OR ALTER PROCEDURE [dbo].[USP_MNT_Almacenes]          
            
	@sOpcion VARCHAR(2) = '',   
	@pParametro VARCHAR(max)
                                                                                   
AS     

BEGIN

	BEGIN
		
		DECLARE @nIdAlmacen INT;		
		DECLARE @nIdUsuario	INT;
		DECLARE @nIdZona	  INT;		
		DECLARE @bEstado	  BIT;
		DECLARE @sNombre	  VARCHAR(MAX);
    DECLARE @sDireccion VARCHAR(MAX);		
			

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
        
		
	IF @sOpcion = '01'   --CONSULTAR almacenes
	BEGIN
			
			SELECT
				alm.nIdAlmacen,
				zon.sNombre AS 'sNombreZona',
				alm.sNombre AS 'sNombreAlmacen',
				IIF(alm.bEstado=1,'Activo', 'Inactivo') AS 'sEstado'
			FROM TBL_ALMACEN alm
			INNER JOIN TBL_ZONA zon ON alm.nIdZona = zon.nIdZona
			INNER JOIN TBL_USUARIO usr ON alm.nIdSupervisor = usr.nIdUsuario
			ORDER BY
				alm.bEstado DESC ,
				alm.nIdZona
                                                                                 
	END;                                     


	ELSE IF @sOpcion = '02'  --CONSULTAR POR ID                                                   
	BEGIN
    BEGIN
			SET @nIdAlmacen	= (SELECT valor FROM @tParametro WHERE id = 1);	
		END	
		
		BEGIN
			SELECT 
				*
			FROM [TBL_ALMACEN] alm			
			WHERE alm.nIdAlmacen=@nIdAlmacen

		END
	END;


	ELSE IF @sOpcion = '03'  --CONSULTAR ZONAS                                                  
	BEGIN
					
    SELECT 
      nIdZona,
      sNombre AS 'sNombreZona'
    FROM [TBL_ZONA]
    WHERE
      bEstado = 1
	
	END;


  ELSE IF @sOpcion = '04'  --CONSULTAR SUPERVISORES
  BEGIN
					
    SELECT 
			  nIdUsuario as 'nIdSupervisor',
			  CONCAT(sNombres,' ',sApellidos) AS 'sNombrePersona'
		FROM [TBL_USUARIO] 
		WHERE 
			nRol	= 2 AND
			bEstado = 1
		ORDER BY	2
				
	END;


	ELSE IF @sOpcion = '05'  --INSERTAR  (R)                                                        
	BEGIN
		BEGIN

      SET @sNombre		  = (SELECT valor FROM @tParametro WHERE id = 1);
			SET @sDireccion		= (SELECT valor FROM @tParametro WHERE id = 2);
			SET @nIdUsuario		= cast((SELECT valor FROM @tParametro WHERE id = 3) AS INT);
			SET @nIdZona			= cast((SELECT valor FROM @tParametro WHERE id = 4) AS INT);			
		
		END	

		BEGIN

			INSERT INTO [TBL_ALMACEN]
					  (sNombre,  sDireccion,  nIdSupervisor, nIdZona,  bEstado)
			VALUES(@sNombre, @sDireccion, @nIdUsuario,   @nIdZona, 1)

      SELECT '1|Se registró con éxito'
      		
		END
		
	END
	   
	   
  ELSE IF @sOpcion = '06'  -- EDITAR   (U)                                                        
  BEGIN
	  BEGIN
		  SET @sNombre		 = (SELECT valor FROM @tParametro WHERE id = 1);
			SET @sDireccion	= (SELECT valor FROM @tParametro WHERE id = 2);
			SET @nIdUsuario	= cast((SELECT valor FROM @tParametro WHERE id = 3) AS INT);
			SET @nIdZona	= CAST((SELECT valor FROM @tParametro WHERE id = 4) AS INT);			
			SET @nIdAlmacen	= cast((SELECT valor FROM @tParametro WHERE id = 5) AS INT);
	END	
                              
		  UPDATE [TBL_ALMACEN]                           
		  SET 
        sNombre       = @sNombre,
        sDireccion    = @sDireccion,
        nIdSupervisor = @nIdUsuario,
        nIdZona       = @nIdZona
		  WHERE 
			  nIdAlmacen = @nIdAlmacen                          

      SELECT '1|Se actualizó con éxito'
        
	END;                            

                                                           
	ELSE IF @sOpcion = '07'  -- ELIMINAR/ACTIVAR (D)                                                          
	BEGIN  
		BEGIN
			SET @nIdAlmacen	= (SELECT valor FROM @tParametro WHERE id = 1);	
			SET @bEstado	  = (SELECT valor FROM @tParametro WHERE id = 2);	
		END	
        
		BEGIN
		
			--Eliminacion Logica
			UPDATE [TBL_ALMACEN]
				SET	 bEstado = @bEstado
			WHERE nIdAlmacen = @nIdAlmacen
        END

      SELECT CONCAT('1|',IIF(@bEstado=1,'Se activó con éxito', 'Se eliminó con éxito'))
        
	END;                                                        
                                       	 
	
END
