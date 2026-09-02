GO
/****** Object:  StoredProcedure [dbo].[USP_MNT_Login] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE OR ALTER PROCEDURE [dbo].[USP_MNT_Login]

    @sNombreUsuario VARCHAR(100) = ''

AS

BEGIN

    SELECT
        usr.nIdUsuario,
        usr.nRol AS 'nIdRol',
        lgn.sNombreUsuario,
        lgn.sContrasenia,
        CONCAT(usr.sNombres, ' ', usr.sApellidos) AS 'sNombrePersona'
    FROM [TBL_LOGIN] lgn
    INNER JOIN [TBL_USUARIO] usr ON usr.nIdUsuario = lgn.nIdUsuario
    WHERE
        lgn.sNombreUsuario = @sNombreUsuario
        AND usr.bEstado = 1;

END;
