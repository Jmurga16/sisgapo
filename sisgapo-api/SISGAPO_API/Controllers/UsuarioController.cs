using Business;
using Entity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SISGAPO_API.Controllers
{
    [ApiController]
    public class UsuarioController : Controller
    {
        UsuarioBusiness objUsuarios = new UsuarioBusiness();

        //Obtener Todos los usuarios
        [Route("UsuariosService")]
        [HttpPost]
        public IActionResult LIS_Usuarios(UsuarioEntity erp)
        {
            List<UsuarioEntity> lstUsuarios = new List<UsuarioEntity>();
            if (erp.sOpcion == "01" || erp.sOpcion == "02" || erp.sOpcion == "03")
            { 
                try
                {
                    var result = objUsuarios.LIS_UsuarioBusiness(erp);

                    return Ok(result);

                }
                catch (Exception)
                {
                    throw;
                }
            }

            else if (erp.sOpcion == "04" || erp.sOpcion == "05" || erp.sOpcion == "06")
            {
                try
                {
                    //string[] lista;

                    string result = Convert.ToString(objUsuarios.LIS_UsuarioBusiness(erp));

                    //lista = result.Split('|');

                    return Ok(new { mensaje = "Ok"});
                }
                catch (Exception )
                {

                    throw;
                }
            }
            else
            {
                return null;
            }

        }
               

    }
}
