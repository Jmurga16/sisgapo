using Entity;
using NLog;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data
{
     public class LoginData
    {
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        #region Conexion
        private readonly Conexion oCon;
        public LoginData()
        {
            oCon = new Conexion(1);
        }
        #endregion



        #region Login
        public object DataLogin(LoginEntity logEnt)
        {

            string msj = string.Empty;

            try
            {
                List<ResultEntity> listaLogin = new List<ResultEntity>();
                using (IDataReader dr = oCon.ejecutarDataReader("USP_MNT_Login", logEnt.sNombreUsuario, logEnt.sContrasenia))
                {
                    while (dr.Read())
                    {
                        ResultEntity resEnt = new ResultEntity();


                        resEnt.Result = Int32.Parse(Convert.ToString(dr["Result"]));
                        resEnt.nIdRol = Int32.Parse(Convert.ToString(dr["nIdRol"]));


                        listaLogin.Add(resEnt);

                    }

                    return listaLogin;
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
