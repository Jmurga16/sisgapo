using Data;
using Entity;
using NLog;
using System;
using System.Threading.Tasks;

namespace Business
{
    public class PanelBusiness
    {
        private readonly PanelData panelData = new PanelData();
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        public async Task<object> BusinessPanel(GeneralEntity genEnt)
        {
            try
            {
                genEnt.pParametro = ParametroDelimitado.Preparar(genEnt.parametros, genEnt.pParametro, false);
                return await panelData.DataPanel(genEnt);
            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
        }
    }
}
