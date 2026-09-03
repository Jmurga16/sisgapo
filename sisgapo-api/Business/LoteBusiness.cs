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
    public class LoteBusiness
    {
        private readonly LoteData loteData = new LoteData();

        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        public object BusinessLote(GeneralEntity genEnt)
        {
            try
            {
                bool bEscritura = genEnt != null && (genEnt.sOpcion == "03" || genEnt.sOpcion == "04" || genEnt.sOpcion == "05");
                genEnt.pParametro = ParametroDelimitado.Preparar(genEnt.parametros, genEnt.pParametro, bEscritura);

                return loteData.DataLote(genEnt);

            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;

            }
        }
    }
}
