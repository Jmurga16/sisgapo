GO
/****** Object:  StoredProcedure [dbo].[USP_MNT_Login]    Script Date: 22/08/2021 16:41:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
                                   
 CREATE OR ALTER PROCEDURE [dbo].[USP_MNT_Login]          
            
	@sNombreUsuario VARCHAR(MAX) = '',   
	@sContrasenia VARCHAR(max)=''
                                                                                   
AS     

BEGIN

	BEGIN
		
		DECLARE @nIdUsuario INT;
		DECLARE @nIdRol INT;	

	END
	
			
	BEGIN
			SELECT  
				ROW_NUMBER() OVER(ORDER BY lgn.nIdUsuario ASC) as 'Result',
				nRol AS 'nIdRol'
			FROM [TBL_LOGIN] lgn
			INNER JOIN [TBL_USUARIO] usr ON usr.nIdUsuario=lgn.nIdUsuario
			WHERE 
				lgn.sNombreUsuario = @sNombreUsuario AND
				lgn.sContrasenia = @sContrasenia

		END
	                            	 
	
END
