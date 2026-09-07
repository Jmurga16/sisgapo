using Data;
using Entity;
using NLog;
using System;
using System.Threading.Tasks;

namespace Business
{
    public class PanelBusiness
    {
        private readonly IPanelData panelData;
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        public PanelBusiness() : this(new PanelData())
        {
        }

        public PanelBusiness(IPanelData panelData)
        {
            this.panelData = panelData ?? throw new ArgumentNullException(nameof(panelData));
        }

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
