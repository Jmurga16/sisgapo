using Data;
using Entity;
using NLog;
using System;

namespace Business
{
    public class PanelBusiness
    {
        private readonly PanelData panelData = new PanelData();
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        public object BusinessPanel(GeneralEntity genEnt)
        {
            try
            {
                genEnt.pParametro = ParametroDelimitado.Preparar(genEnt.parametros, genEnt.pParametro, false);
                return panelData.DataPanel(genEnt);
            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
        }
    }
}
