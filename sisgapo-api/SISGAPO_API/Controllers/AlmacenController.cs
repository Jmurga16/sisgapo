using Business;
using Entity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
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
    [Authorize]
    public class AlmacenController : Controller
    {

        private readonly AlmacenBusiness objInventario;
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        public AlmacenController(AlmacenBusiness objInventario)
        {
            this.objInventario = objInventario;
        }

        #region Almacen

        [HttpPost]
        public async Task<IActionResult> CrudAlmacen(GeneralEntity genEnt) // fnServAlmacenes
        {

            if (genEnt == null)
            {
                return BadRequest(new { cod = "0", mensaje = "Falta el cuerpo de la peticion." });
            }

            if (genEnt.sOpcion == "01" || genEnt.sOpcion == "02" || genEnt.sOpcion == "03" || genEnt.sOpcion == "04")
            {
                try
                {
                    var vRes = await objInventario.BusinessAlmacen(genEnt);

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
                if (!User.IsInRole("1") && !User.IsInRole("2"))
                {
                    return Forbid();
                }

                try
                {
                    string sResultado = Convert.ToString(await objInventario.BusinessAlmacen(genEnt));
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

                return BadRequest(new { cod = "0", mensaje = $"Opcion no soportada: {genEnt.sOpcion}" });
            }

        }

        #endregion



    }
}
