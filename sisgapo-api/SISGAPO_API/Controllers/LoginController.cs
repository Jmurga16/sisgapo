using Business;
using Entity;
using Microsoft.AspNetCore.Mvc;
using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SISGAPO_API.Controllers
{
    [Route("LoginService")]
    [ApiController]
    public class LoginController : Controller
    {
        private readonly LoginBusiness objLogin = new LoginBusiness();
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        [HttpPost]
        public IActionResult CrudLogin(LoginEntity logEnt) // fnServAlmacenes
        {
            try
            {
                var vRes = objLogin.BusinessAlmacen(logEnt);

                return Ok(vRes);
            }
            catch (Exception e)
            {

                logger.Error(e);
                throw;

            }
        }
    }
}
