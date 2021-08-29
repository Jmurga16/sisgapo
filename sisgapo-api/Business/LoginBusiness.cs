using Data;
using Entity;
using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business
{
    public class LoginBusiness
    {
        private readonly LoginData loginData = new LoginData();
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        private object result;

        public object BusinessAlmacen(LoginEntity logEnt)
        {
            try
            {


                result = loginData.DataLogin(logEnt);

                return result;

            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;

            }
        }
    }
}
