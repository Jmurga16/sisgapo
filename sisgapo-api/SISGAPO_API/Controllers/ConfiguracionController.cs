using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace SISGAPO_API.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("ConfiguracionService")]
    public class ConfiguracionController : ControllerBase
    {
        private readonly IConfiguration configuration;

        public ConfiguracionController(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        [HttpGet]
        public IActionResult Obtener()
        {
            return Ok(new
            {
                demoSoloLectura = configuration.GetValue<bool>("Demo:SoloLectura")
            });
        }
    }
}
