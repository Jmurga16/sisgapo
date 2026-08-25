using Business;
using Entity;
using Microsoft.AspNetCore.Mvc;
using NLog;
using System;

namespace SISGAPO_API.Controllers
{
    /// <summary>
    /// Panel de inicio. Modulo nuevo: hasta ahora la pantalla que se abria
    /// despues de entrar estaba vacia (inicio.component.html pesaba 0 bytes).
    ///
    /// Solo lectura. Sigue el patron sOpcion/pParametro del resto del sistema:
    ///   01  tarjetas de resumen
    ///   02  existencias por almacen
    ///   03  existencias por categoria
    ///   04  proximos a vencer (pParametro = dias, por defecto 90)
    /// </summary>
    [ApiController]
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
