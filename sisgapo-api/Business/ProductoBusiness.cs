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
        private readonly IProductoData productoData;
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        public ProductoBusiness() : this(new ProductoData())
        {
        }

        public ProductoBusiness(IProductoData productoData)
        {
            this.productoData = productoData ?? throw new ArgumentNullException(nameof(productoData));
        }

        public async Task<object> BusinessProducto(GeneralEntity genEnt)
        {
            try
            {
                bool bEscritura = genEnt != null && (genEnt.sOpcion == "06" || genEnt.sOpcion == "07" || genEnt.sOpcion == "08");
                genEnt.pParametro = ParametroDelimitado.Preparar(genEnt.parametros, genEnt.pParametro, bEscritura);

                return await productoData.DataProducto(genEnt);

            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;

            }
        }
    }
}
