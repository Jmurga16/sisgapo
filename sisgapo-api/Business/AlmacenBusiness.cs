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
        private readonly IAlmacenData almacenData;
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        public AlmacenBusiness() : this(new AlmacenData())
        {
        }

        public AlmacenBusiness(IAlmacenData almacenData)
        {
            this.almacenData = almacenData ?? throw new ArgumentNullException(nameof(almacenData));
        }

        public async Task<object> BusinessAlmacen(GeneralEntity genEnt)
        {
            try
            {
                bool bEscritura = genEnt != null && (genEnt.sOpcion == "05" || genEnt.sOpcion == "06" || genEnt.sOpcion == "07");
                genEnt.pParametro = ParametroDelimitado.Preparar(genEnt.parametros, genEnt.pParametro, bEscritura);

                return await almacenData.DataAlmacen(genEnt);

            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;

            }
        }


    }
}
