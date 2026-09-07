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
    public class MovimientoBusiness
    {
        private readonly IMovimientoData movimientoData;
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        public MovimientoBusiness() : this(new MovimientoData())
        {
        }

        public MovimientoBusiness(IMovimientoData movimientoData)
        {
            this.movimientoData = movimientoData ?? throw new ArgumentNullException(nameof(movimientoData));
        }

        public async Task<object> BusinessMovimiento(GeneralEntity genEnt)
        {
            try
            {
                bool bEscritura = genEnt != null && genEnt.sOpcion == "02";
                genEnt.pParametro = ParametroDelimitado.Preparar(genEnt.parametros, genEnt.pParametro, bEscritura);

                return await movimientoData.DataMovimiento(genEnt);

            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;

            }
        }
    }
}
