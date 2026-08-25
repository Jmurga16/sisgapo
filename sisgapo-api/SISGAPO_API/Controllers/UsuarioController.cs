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
    [ApiController]
    public class UsuarioController : Controller
    {
        private readonly UsuarioBusiness objUsuarios = new UsuarioBusiness();
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        //Obtener Todos los usuarios
        [Route("UsuariosService")]
        [HttpPost]
        public IActionResult LIS_Usuarios(UsuarioEntity erp)
        {
           
            if (erp.sOpcion == "01" || erp.sOpcion == "02" || erp.sOpcion == "03")
            { 
                try
                {
                    var result = objUsuarios.LIS_UsuarioBusiness(erp);

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
                    
                    string result = Convert.ToString(objUsuarios.LIS_UsuarioBusiness(erp));
                    
                    return Ok(new { mensaje = result});
                }
                catch (Exception e)
                {
                    logger.Error(e);
                    throw;
                }
            }
            else
            {
                //Antes esto era 'return null', que ASP.NET Core traduce a 204 No Content
                //con cuerpo vacio: el frontend recibia null y fallaba al leer sus
                //propiedades, sin mensaje para el usuario. Ver 06-hallazgos.md C-08.
                return BadRequest(new { cod = "0", mensaje = $"Opcion no soportada: {erp.sOpcion}" });
            }

        }
               

    }
}
