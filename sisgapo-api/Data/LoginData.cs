using Entity;
using NLog;
using System;
using System.Data;

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
        public CredencialEntity ObtenerPorUsuario(string sNombreUsuario)
        {
            try
            {
                using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Login", sNombreUsuario))
                {
                    if (!dr.Read())
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
