using Business;
using Entity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SISGAPO_API.Controllers
{
    [Route("AlmacenesService")]
    [ApiController]
    public class AlmacenController : Controller
    {

        private readonly AlmacenBusiness objInventario = new AlmacenBusiness();
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        #region Almacen

        [HttpPost]
        public IActionResult CrudAlmacen(GeneralEntity genEnt) // fnServAlmacenes
        {

            if (genEnt.sOpcion == "01" || genEnt.sOpcion == "02" || genEnt.sOpcion == "03" || genEnt.sOpcion == "04")
            {
                try
                {
                    var vRes = objInventario.BusinessAlmacen(genEnt);

                    return Ok(vRes);
                }
                catch (Exception e)
                {

                    logger.Error(e);
                    throw;

                }
            }

            else if (genEnt.sOpcion == "05" || genEnt.sOpcion == "06" || genEnt.sOpcion == "07")
            {
                try
                {
                    string sResultado = Convert.ToString(objInventario.BusinessAlmacen(genEnt));
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
                //Antes esto era 'return null', que ASP.NET Core traduce a 204 No Content
                //con cuerpo vacio: el frontend recibia null y fallaba al leer sus
                //propiedades, sin mensaje para el usuario. Ver 06-hallazgos.md C-08.
                return BadRequest(new { cod = "0", mensaje = $"Opcion no soportada: {genEnt.sOpcion}" });
            }

        }

        #endregion



    }
}
