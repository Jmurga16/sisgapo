GO
/****** Object:  StoredProcedure [dbo].[USP_MNT_Zonas] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*  Zonas — mantenimiento.

    Cambios respecto al original de 2021 (ver 06-hallazgos.md, C-03 y C-05):
      [1] No existía la actualización. El formulario de edición cargaba la zona
          por id y al guardar llamaba igual a la opción 03 (INSERT), así que
          editar una zona creaba un duplicado.
      [2] No existía la baja. Se añade baja lógica con TBL_ZONA.bEstado, igual
          que en usuarios, almacenes, categorías y productos.
      [3] La comprobación de duplicados no tenía rama ELSE: si el nombre ya
          existía, el procedimiento no devolvía nada, la capa de datos devolvía
          cadena vacía y la pantalla navegaba al listado como si hubiera
          guardado. Ahora todas las escrituras responden 'cod|mensaje', que es
          el contrato del resto del sistema.
      [4] La comparación era  sNombre = LOWER(@sNombre), que solo funciona por
          accidente con intercalación insensible a mayúsculas.

    @bEstado lleva valor por defecto para no romper a quien llame con los
    cuatro parámetros de siempre.
*/
CREATE OR ALTER PROCEDURE [dbo].[USP_MNT_Zonas]

    @sOpcion     VARCHAR(2)    = '',
    @nIdZona     INT           = 0,
    @sNombre     VARCHAR(200)  = '',
    @sRutaImagen VARCHAR(1000) = '',
    @bEstado     BIT           = 1

AS

BEGIN

    IF @sOpcion = '01'   --CONSULTAR TODO
    BEGIN

        SELECT
            nIdZona,
            sNombre,
            sRutaImagen,
            bEstado,
            IIF(bEstado = 1, 'Activo', 'Inactivo') AS 'sEstado'
        FROM TBL_ZONA
        ORDER BY
            bEstado DESC, sNombre;

    END;


    ELSE IF @sOpcion = '02'   --CONSULTAR UNICO
    BEGIN

        SELECT
            nIdZona,
            sNombre,
            sRutaImagen,
            bEstado,
            IIF(bEstado = 1, 'Activo', 'Inactivo') AS 'sEstado'
        FROM TBL_ZONA
        WHERE
            nIdZona = @nIdZona;

    END;


    ELSE IF @sOpcion = '03'  --INSERTAR
    BEGIN

        IF EXISTS (SELECT 1 FROM TBL_ZONA WHERE LOWER(sNombre) = LOWER(@sNombre))
        BEGIN
            SELECT '0|Ya existe una zona con ese nombre';
        END
        ELSE
        BEGIN
            INSERT INTO TBL_ZONA (sNombre, sRutaImagen, bEstado)
            VALUES (@sNombre, @sRutaImagen, 1);

            SELECT '1|Se registró con éxito';
        END

    END;


    ELSE IF @sOpcion = '04'  --ACTUALIZAR
    BEGIN

        IF NOT EXISTS (SELECT 1 FROM TBL_ZONA WHERE nIdZona = @nIdZona)
        BEGIN
            SELECT '0|La zona indicada no existe';
        END
        --El duplicado se busca excluyendo la propia zona, para poder guardar
        --sin cambiar el nombre.
        ELSE IF EXISTS (SELECT 1 FROM TBL_ZONA
                         WHERE LOWER(sNombre) = LOWER(@sNombre)
                           AND nIdZona <> @nIdZona)
        BEGIN
            SELECT '0|Ya existe otra zona con ese nombre';
        END
        ELSE
        BEGIN
            UPDATE TBL_ZONA
               SET sNombre     = @sNombre,
                   sRutaImagen = @sRutaImagen
             WHERE nIdZona = @nIdZona;

            SELECT '1|Se actualizó con éxito';
        END

    END;


    ELSE IF @sOpcion = '05'  --ACTIVAR / DAR DE BAJA (lógica)
    BEGIN

        --Una zona con almacenes activos no se puede dar de baja: dejaría
        --almacenes colgando de una zona inactiva.
        IF (@bEstado = 0 AND EXISTS (SELECT 1 FROM TBL_ALMACEN
                                      WHERE nIdZona = @nIdZona AND bEstado = 1))
        BEGIN
            SELECT '0|No se puede dar de baja: la zona tiene almacenes activos';
        END
        ELSE
        BEGIN
            UPDATE TBL_ZONA
               SET bEstado = @bEstado
             WHERE nIdZona = @nIdZona;

            SELECT CONCAT('1|', IIF(@bEstado = 1, 'Se activó con éxito', 'Se dio de baja con éxito'));
        END

    END;

END;
