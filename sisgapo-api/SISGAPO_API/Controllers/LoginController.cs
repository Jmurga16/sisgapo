using Business;
using Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using NLog;
using SISGAPO_API.Seguridad;
using System;
using System.Threading.Tasks;

namespace SISGAPO_API.Controllers
{
    [Route("LoginService")]
    [ApiController]
    [AllowAnonymous]
    [EnableRateLimiting("Login")]
    public class LoginController : Controller
    {
        private readonly LoginBusiness objLogin = new LoginBusiness();
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        [HttpPost]
        public async Task<IActionResult> CrudLogin(LoginEntity logEnt)
        {
            if (logEnt == null)
            {
                return BadRequest(new { cod = "0", mensaje = "Falta el cuerpo de la peticion." });
            }

            try
            {
                CredencialEntity oCredencial = await objLogin.fnVerificarCredenciales(logEnt);

                if (oCredencial == null)
                {
                    return Unauthorized(new { cod = "0", mensaje = "Usuario o contraseña incorrectos." });
                }

                return Ok(GeneradorToken.fnEmitir(oCredencial));
            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
        }
    }
}
