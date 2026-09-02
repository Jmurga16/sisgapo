using Business;
using Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using NLog;
using SISGAPO_API.Seguridad;
using System;

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
        public IActionResult CrudLogin(LoginEntity logEnt)
        {
            try
            {
                CredencialEntity oCredencial = objLogin.fnVerificarCredenciales(logEnt);

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
