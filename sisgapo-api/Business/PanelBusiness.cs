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
