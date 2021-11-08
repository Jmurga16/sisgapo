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
    public class ClienteBusiness
    {
        private readonly ClienteData clienteData = new ClienteData();
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        public object BusinessCliente(GeneralEntity genEnt)
        {
            try
            {

                return clienteData.DataCliente(genEnt);

            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;

            }
        }

    }
}
