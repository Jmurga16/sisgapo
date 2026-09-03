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
        private readonly MovimientoData movimientoData = new MovimientoData();

        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        public object BusinessMovimiento(GeneralEntity genEnt)
        {
            try
            {
                bool bEscritura = genEnt != null && genEnt.sOpcion == "02";
                genEnt.pParametro = ParametroDelimitado.Preparar(genEnt.parametros, genEnt.pParametro, bEscritura);

                return movimientoData.DataMovimiento(genEnt);

            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;

            }
        }
    }
}
