using Business;
using Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SISGAPO_API.Controllers
{
    [ApiController]
    [Authorize(Roles = "1")]
    public class UsuarioController : Controller
    {
        private readonly UsuarioBusiness objUsuarios;
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        public UsuarioController(UsuarioBusiness objUsuarios)
        {
            this.objUsuarios = objUsuarios;
        }

        //Obtener Todos los usuarios
        [Route("UsuariosService")]
        [HttpPost]
        public async Task<IActionResult> LIS_Usuarios(GeneralEntity erp)
        {
           
            if (erp == null)
            {
                return BadRequest(new { cod = "0", mensaje = "Falta el cuerpo de la peticion." });
            }

            if (erp.sOpcion == "01" || erp.sOpcion == "02" || erp.sOpcion == "03")
            { 
                try
                {
                    var result = await objUsuarios.LIS_UsuarioBusiness(erp);

                    return Ok(result);

                }
                catch (Exception e)
                {
                    logger.Error(e);
                    throw;
                }
            }

            else if (erp.sOpcion == "04" || erp.sOpcion == "05" || erp.sOpcion == "06")
            {
                try
                {
                    string sResultado = Convert.ToString(await objUsuarios.LIS_UsuarioBusiness(erp));
                    string[] listaRes = (sResultado ?? "").Split('|');

                    return Ok(new
                    {
                        cod = listaRes[0],
                        mensaje = listaRes.Length > 1 ? listaRes[1] : ""
                    });
                }
                catch (Exception e)
                {
                    logger.Error(e);
                    throw;
                }
            }
            else
            {

                return BadRequest(new { cod = "0", mensaje = $"Opcion no soportada: {erp.sOpcion}" });
            }

        }
               

    }
}
