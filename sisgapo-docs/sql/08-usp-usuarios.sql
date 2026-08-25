GO
/****** Object:  StoredProcedure [dbo].[USP_MNT_Usuarios]    Script Date: 22/08/2021 16:42:27 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
                                   
 CREATE OR ALTER PROCEDURE [dbo].[USP_MNT_Usuarios]          
            
	@sOpcion VARCHAR(2) = '',   
	@pParametro VARCHAR(max)
                                                                                   
AS     

BEGIN

	BEGIN
		
		DECLARE @nIdUsuario INT;
		DECLARE @sContrasenia VARCHAR(MAX)
		DECLARE @sNombreUsuario VARCHAR(MAX)
		DECLARE @sNombres VARCHAR(MAX);
		DECLARE @bEstado BIT;
		DECLARE @nEstado INT;
		DECLARE @nIdRol INT;
		DECLARE @sApellidos		  VARCHAR(MAX);
		DECLARE @nTipoDoc		  INT;
		DECLARE @sNumDoc		  VARCHAR(MAX);
		DECLARE @sSexo			  VARCHAR(MAX);		
		DECLARE @sDireccion		  VARCHAR(MAX);
		DECLARE @nTelefono		  INT;
		DECLARE @dFechaNacimiento DATE;
		DECLARE @nContador INT

	

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
        
		
	IF @sOpcion = '01'   --CONSULTAR TODO  --Lista de Disponibilidad->Todos
	BEGIN	                                                                                                                                                     
			SELECT 
				usr.nIdUsuario, 
				CONCAT(usr.sNombres,' ',usr.sApellidos) AS 'sNombrePersona',
				lgn.sNombreUsuario,
				rol.sNombreRol,
				IIF(usr.bEstado=1,'Activo', 'Inactivo') AS 'sEstado'
			FROM [TBL_USUARIO] usr
			INNER JOIN [TBL_LOGIN] lgn ON lgn.nIdUsuario=usr.nIdUsuario
			INNER JOIN [TBL_ROL] rol ON rol.nIdRol=usr.nRol
			ORDER BY
				usr.bEstado DESC ,
				usr.nIdUsuario
				
                                                                                 
	END;                                     


	ELSE IF @sOpcion = '02'  --CONSULTAR POR FILTROS                                                  
	BEGIN
		BEGIN
			SET @sNombres	= (SELECT valor FROM @tParametro WHERE id = 1);						
			SET @nIdRol		= CAST((SELECT valor FROM @tParametro WHERE id = 2) AS INT);			
			SET @nEstado	= (SELECT valor FROM @tParametro WHERE id = 3) ;
		END	
		
		BEGIN
					
			BEGIN
		
				SELECT 
					usr.nIdUsuario, 
					CONCAT(usr.sNombres,' ',usr.sApellidos) AS 'sNombrePersona',  
					lgn.sNombreUsuario,
					rol.sNombreRol,
					IIF(usr.bEstado=1,'Activo', 'Inactivo') AS 'sEstado'
				FROM [TBL_USUARIO] usr
				INNER JOIN [TBL_LOGIN] lgn ON lgn.nIdUsuario=usr.nIdUsuario
				INNER JOIN [TBL_ROL] rol ON rol.nIdRol=usr.nRol
				WHERE
					usr.sNombres	LIKE '%'+@sNombres+'%'			AND
					rol.nIdRol = IIF(@nIdRol=0,usr.nRol , @nIdRol)	AND
					usr.bEstado= IIF(@nEstado=2,usr.bEstado , @nEstado)
				ORDER BY
					usr.bEstado DESC ,
					usr.nIdUsuario
			END

		END
	
	END;


	ELSE IF @sOpcion = '03'  --CONSULTAR POR ID                                                   
	BEGIN
		BEGIN
			SET @nIdUsuario	= (SELECT valor FROM @tParametro WHERE id = 1);	
		END	
		
		BEGIN
			SELECT 
				*,
				CONVERT(VARCHAR, usr.dFechaNacimiento,23) AS 'dFechaNac'
			FROM [TBL_USUARIO] usr
			INNER JOIN [TBL_LOGIN] lgn ON lgn.nIdUsuario=usr.nIdUsuario
			WHERE usr.nIdUsuario=@nIdUsuario

		END
	END;

	ELSE IF @sOpcion = '04'  --INSERTAR  (R)                                                        
	BEGIN
		BEGIN
			SET @sNombres			= (SELECT valor FROM @tParametro WHERE id = 1);
			SET @sApellidos			= (SELECT valor FROM @tParametro WHERE id = 2);
			SET @nTipoDoc			= cast((SELECT valor FROM @tParametro WHERE id = 3) AS INT);
			SET @sNumDoc			= (SELECT valor FROM @tParametro WHERE id = 4);
			SET @sSexo				= (SELECT valor FROM @tParametro WHERE id = 5);			
			SET @nIdRol				= cast((SELECT valor FROM @tParametro WHERE id = 6) AS INT);
			SET @sDireccion			= (SELECT valor FROM @tParametro WHERE id = 7);
			SET @nTelefono			= (SELECT valor FROM @tParametro WHERE id = 8);
			SET @dFechaNacimiento	= (SELECT valor FROM @tParametro WHERE id = 9);
			SET @sContrasenia		= (SELECT valor FROM @tParametro WHERE id = 10);
		END	

		BEGIN

			INSERT INTO [TBL_USUARIO]
					(sNombres,sApellidos,nTipoDoc,sNumDoc,sSexo,nRol,sDireccion,nTelefono,dFechaNacimiento,bEstado)
			VALUES(@sNombres,@sApellidos,@nTipoDoc,@sNumDoc,@sSexo,@nIdRol,@sDireccion,@nTelefono,@dFechaNacimiento,1)

			SET @nIdUsuario = SCOPE_IDENTITY()

			SET @sNombreUsuario = CONCAT(SUBSTRING(@sNombres,1,CHARINDEX(' ', @sNombres+' ',1)-1),'.',SUBSTRING(@sApellidos,1,CHARINDEX(' ', @sApellidos+' ',1)-1))

			SET @nContador = (SELECT COUNT(*) FROM [TBL_USUARIO] WHERE sNombres=LOWER(@sNombres) AND sApellidos=LOWER(@sApellidos))+1
			
			IF(@nContador>0)
			BEGIN
				SET @sNombreUsuario = CONCAT(@sNombreUsuario,@nContador)
			END


			INSERT INTO [TBL_LOGIN]
					(nIdUsuario, sNombreUsuario, sContrasenia)
			VALUES(@nIdUsuario , LOWER(@sNombreUsuario),@sContrasenia)


		END
		
	END
	   
	   
	ELSE IF @sOpcion = '05'  -- EDITAR   (U)                                                        
	BEGIN
		BEGIN
			SET @sNombres			= (SELECT valor FROM @tParametro WHERE id = 1);
			SET @sApellidos			= (SELECT valor FROM @tParametro WHERE id = 2);
			SET @nTipoDoc			= cast((SELECT valor FROM @tParametro WHERE id = 3) AS INT);
			SET @sNumDoc			= (SELECT valor FROM @tParametro WHERE id = 4);
			SET @sSexo				= (SELECT valor FROM @tParametro WHERE id = 5);			
			SET @nIdRol				= cast((SELECT valor FROM @tParametro WHERE id = 6) AS INT);
			SET @sDireccion			= (SELECT valor FROM @tParametro WHERE id = 7);
			SET @nTelefono			= cast((SELECT valor FROM @tParametro WHERE id = 8) AS INT);
			SET @dFechaNacimiento	= (SELECT valor FROM @tParametro WHERE id = 9);
			SET @sContrasenia		= (SELECT valor FROM @tParametro WHERE id = 10);
			SET @nIdUsuario			= (SELECT valor FROM @tParametro WHERE id = 11);
		END	
                                     
		 UPDATE [TBL_USUARIO]                           
		 SET 
			sNombres			= @sNombres,                           
			sApellidos			= @sApellidos,       
			nTipoDoc			= @nTipoDoc,
			sNumDoc				= @sNumDoc,
			sSexo				= @sSexo,
			nRol				= @nIdRol,
			sDireccion			= @sDireccion,
			nTelefono			= @nTelefono,
			dFechaNacimiento	= @dFechaNacimiento
		 WHERE 
			nIdUsuario = @nIdUsuario                          
		 
		 UPDATE [TBL_LOGIN]                           
		 SET 
			sContrasenia	= @sContrasenia
		 WHERE 
			nIdUsuario = @nIdUsuario  
                                                       
	END;                            

                                                           
	ELSE IF @sOpcion = '06'  -- ELIMINAR (D)                                                          
	BEGIN  
		BEGIN
			SET @nIdUsuario	= (SELECT valor FROM @tParametro WHERE id = 1);	
			SET @bEstado	= (SELECT valor FROM @tParametro WHERE id = 2);	
		END	
        
		BEGIN
			
			--Eliminación Directa                                                             
			--DELETE FROM TB_Libro WHERE Id_libro = @nId_libro         
		
			--Eliminacion Logica
			UPDATE [TBL_USUARIO]
				SET	 bEstado = @bEstado
			WHERE nIdUsuario = @nIdUsuario
        END                                               
	END;                                                        
                                       	 
	
END
