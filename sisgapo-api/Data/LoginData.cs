using Entity;
using NLog;
using System;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;

namespace Data
{
    public class LoginData : ILoginData
    {
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        #region Conexion
        private readonly Conexion oCon;

        public LoginData()
        {
            oCon = new Conexion(1);
        }
        #endregion


        #region Obtener credencial
        public async Task<CredencialEntity> ObtenerPorUsuario(string sNombreUsuario)
        {
            try
            {
                using (SqlDataReader dr = await oCon.fnEjecutarDataReaderAsync("USP_MNT_Login", sNombreUsuario))
                {
                    if (!await dr.ReadAsync())
                    {
                        return null;
                    }

                    return new CredencialEntity
                    {
                        nIdUsuario = Convert.ToInt32(dr["nIdUsuario"]),
                        nIdRol = Convert.ToInt32(dr["nIdRol"]),
                        sNombreUsuario = Convert.ToString(dr["sNombreUsuario"]),
                        sContrasenia = Convert.ToString(dr["sContrasenia"]),
                        sNombrePersona = Convert.ToString(dr["sNombrePersona"])
                    };
                }
            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
        }
        #endregion
    }
}
