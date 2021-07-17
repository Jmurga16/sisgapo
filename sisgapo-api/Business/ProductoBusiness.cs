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
    public class ProductoBusiness
    {
        private readonly ProductoData productoData = new ProductoData();
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        public object BusinessProducto(GeneralEntity genEnt)
        {
            try
            {

                return 1;

            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;

            }
        }
    }
}
