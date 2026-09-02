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
                bool bEscritura = genEnt != null && (genEnt.sOpcion == "05" || genEnt.sOpcion == "06" || genEnt.sOpcion == "07");
                genEnt.pParametro = ParametroDelimitado.Preparar(genEnt.parametros, genEnt.pParametro, bEscritura);

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
