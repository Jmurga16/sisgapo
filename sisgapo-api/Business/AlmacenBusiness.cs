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
    public class AlmacenBusiness
    {

        private readonly AlmacenData almacenData = new AlmacenData();
        private readonly Logger logger = LogManager.GetCurrentClassLogger();


        public object BusinessAlmacen(GeneralEntity genEnt)
        {
            try
            {

                return almacenData.DataAlmacen(genEnt);

            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;

            }
        }


    }
}
