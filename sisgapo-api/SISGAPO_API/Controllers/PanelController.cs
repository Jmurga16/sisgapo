using Business;
using Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NLog;
using System;
using System.Threading.Tasks;

namespace SISGAPO_API.Controllers
{

    [ApiController]
    [Authorize]
    [Route("[controller]")]
    public class PanelController : Controller
    {
        private readonly PanelBusiness objPanel;
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        public PanelController(PanelBusiness objPanel)
        {
            this.objPanel = objPanel;
        }

        [HttpPost]
        public async Task<IActionResult> CrudPanel(GeneralEntity genEnt)
        {
            if (genEnt == null)
            {
                return BadRequest(new { cod = "0", mensaje = "Falta el cuerpo de la peticion." });
            }

            if (genEnt.sOpcion == "01" || genEnt.sOpcion == "02" ||
                genEnt.sOpcion == "03" || genEnt.sOpcion == "04")
            {
                try
                {
                    return Ok(await objPanel.BusinessPanel(genEnt));
                }
                catch (Exception e)
                {
                    logger.Error(e);
                    throw;
                }
            }

            return BadRequest(new { cod = "0", mensaje = $"Opcion no soportada: {genEnt.sOpcion}" });
        }
    }
}
