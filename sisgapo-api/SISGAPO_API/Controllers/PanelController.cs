using Business;
using Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NLog;
using System;

namespace SISGAPO_API.Controllers
{

    [ApiController]
    [Authorize]
    [Route("[controller]")]
    public class PanelController : Controller
    {
        private readonly PanelBusiness objPanel = new PanelBusiness();
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        [HttpPost]
        public IActionResult CrudPanel(GeneralEntity genEnt)
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
                    return Ok(objPanel.BusinessPanel(genEnt));
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
