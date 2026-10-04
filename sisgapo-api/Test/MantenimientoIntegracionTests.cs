using System;
using Microsoft.Data.SqlClient;
using Xunit;

namespace Test
{
    public class MantenimientoIntegracionTests
    {
        [HechoConBaseDeDatos]
        public void UnUsuarioSeDaDeAltaSeEditaYSeDesactivaConRespuestaCodMensaje()
        {
            using (SqlConnection conn = BaseDeDatosPruebas.fnAbrir())
            {
                //Ningún documento del seed empieza por 5.
                string sDocumento = "5" + new Random().Next(0, 9999999).ToString("D7");
                string sDatos = String.Format(
                    "Prueba|Integracion|1|{0}|M|3|Av. Prueba 1|912345678|1990-01-01|hash", sDocumento);

                try
                {
                    string sAlta = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Usuarios", "04", sDatos);
                    Assert.StartsWith("1|Se registró con éxito. Usuario: prueba.integracion", sAlta);

                    int nIdUsuario = Convert.ToInt32(BaseDeDatosPruebas.fnEscalar(conn, String.Format(
                        "SELECT nIdUsuario FROM TBL_USUARIO WHERE nTipoDoc = 1 AND sNumDoc = '{0}'", sDocumento)));

                    string sEdicion = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Usuarios", "05",
                        String.Format("{0}||{1}", sDatos.Replace("|hash", ""), nIdUsuario));
                    Assert.Equal("1|Se actualizó con éxito", sEdicion);

                    string sBaja = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Usuarios", "06",
                        String.Format("{0}|0", nIdUsuario));
                    Assert.Equal("1|Se desactivó con éxito", sBaja);
                }
                finally
                {
                    BaseDeDatosPruebas.fnEjecutarSentencia(conn, String.Format(
                        "DELETE lgn FROM TBL_LOGIN lgn INNER JOIN TBL_USUARIO usr ON usr.nIdUsuario = lgn.nIdUsuario " +
                        "WHERE usr.nTipoDoc = 1 AND usr.sNumDoc = '{0}'; " +
                        "DELETE FROM TBL_USUARIO WHERE nTipoDoc = 1 AND sNumDoc = '{0}';", sDocumento));
                }
            }
        }

        [HechoConBaseDeDatos]
        public void UnDocumentoRepetidoNoDaDeAltaAOtroUsuario()
        {
            using (SqlConnection conn = BaseDeDatosPruebas.fnAbrir())
            {
                int nAntes = fnContar(conn, "TBL_USUARIO");

                string sRespuesta = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Usuarios", "04",
                    "Otra|Persona|1|80808080|F|3|Jr. Prueba 2|912345678|1990-01-01|hash");

                Assert.Equal("0|Ya existe un usuario con ese documento", sRespuesta);
                Assert.Equal(nAntes, fnContar(conn, "TBL_USUARIO"));
            }
        }

        [HechoConBaseDeDatos]
        public void EditarODesactivarUnUsuarioQueNoExisteLoDice()
        {
            using (SqlConnection conn = BaseDeDatosPruebas.fnAbrir())
            {
                string sEdicion = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Usuarios", "05",
                    "Nadie|Nadie|1|59999999|M|3|Sin direccion|912345678|1990-01-01||999999");
                string sBaja = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Usuarios", "06", "999999|0");

                Assert.Equal("0|El usuario no existe", sEdicion);
                Assert.Equal("0|El usuario no existe", sBaja);
            }
        }

        [HechoConBaseDeDatos]
        public void UnAlmacenSoloAdmiteComoSupervisorAUnSupervisorActivo()
        {
            using (SqlConnection conn = BaseDeDatosPruebas.fnAbrir())
            {
                //El usuario 1 es el administrador del seed.
                string sAlta = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Almacenes", "05",
                    "Almacén de prueba|Av. Prueba 3|1|1");
                string sEdicion = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Almacenes", "06",
                    "Almacén Central Satipo|Av. Marginal 101, Satipo|1|1|1");

                Assert.Equal("0|El supervisor debe ser un usuario activo con rol de supervisor", sAlta);
                Assert.Equal("0|El supervisor debe ser un usuario activo con rol de supervisor", sEdicion);
            }
        }

        [HechoConBaseDeDatos]
        public void UnAlmacenNoRepiteElNombreDeOtro()
        {
            using (SqlConnection conn = BaseDeDatosPruebas.fnAbrir())
            {
                string sAlta = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Almacenes", "05",
                    " almacén central satipo |Av. Prueba 4|2|1");
                string sEdicion = BaseDeDatosPruebas.fnEjecutar(conn, "USP_MNT_Almacenes", "06",
                    "Almacén Norte Huaraz|Av. Marginal 101, Satipo|2|1|1");

                Assert.Equal("0|Ya existe un almacén con ese nombre", sAlta);
                Assert.Equal("0|Ya existe otro almacén con ese nombre", sEdicion);
            }
        }

        private static int fnContar(SqlConnection conn, string sTabla)
        {
            return Convert.ToInt32(BaseDeDatosPruebas.fnEscalar(conn, "SELECT COUNT(*) FROM " + sTabla));
        }
    }
}
