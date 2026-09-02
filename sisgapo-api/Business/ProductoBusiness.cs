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
                bool bEscritura = genEnt != null && (genEnt.sOpcion == "06" || genEnt.sOpcion == "07" || genEnt.sOpcion == "08");
                genEnt.pParametro = ParametroDelimitado.Preparar(genEnt.parametros, genEnt.pParametro, bEscritura);

                return productoData.DataProducto(genEnt);

            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;

            }
        }
    }
}
