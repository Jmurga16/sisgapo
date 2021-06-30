USE [DB_SISGAPO]
GO
                                   
CREATE PROCEDURE [dbo].[USP_MNT_Zonas]          
            
@sOpcion VARCHAR(2)= '',   
@nIdZona INT = 0,
@sNombre VARCHAR(100)='',
@sRutaImagen VARCHAR(MAX)
                                 
AS

BEGIN
              
  IF @sOpcion = '01'   --CONSULTAR TODO
  BEGIN

       SELECT *	FROM TBL_Zona
	                                                                             
  END;                                     


  IF @sOpcion = '02'   --CONSULTAR UNICO
  BEGIN	
	    SELECT
        *
      FROM TBL_Zona
      WHERE
        nIdZona=@nIdZona    
  END;


  IF @sOpcion = '03'  --INSERTAR                                                      
  BEGIN	

	  INSERT INTO TBL_Zona (sNombre,sRutaImagen)
	   VALUES (@sNombre,@sRutaImagen);     

  END

END;
