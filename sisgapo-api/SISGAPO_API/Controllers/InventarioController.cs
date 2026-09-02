using Business;
using Entity;
using Microsoft.AspNetCore.Cors;
//using System.Web.Http.Cors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NLog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SISGAPO_API.Controllers
{
    [Route("InventarioService")]
    [ApiController]
    [Authorize]

    public class InventarioController : Controller
    {
        private readonly CategoriaBusiness objCategoria = new CategoriaBusiness();
        private readonly ProductoBusiness objProducto = new ProductoBusiness();

        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        #region Categoria

        [HttpPost, Route("Categoria")]
        public IActionResult CrudCategoria(GeneralEntity genEnt) // fnServCategoria
        {

            if (genEnt.sOpcion == "01" || genEnt.sOpcion == "02" )
            {
                try
                {
                    var vRes = objCategoria.BusinessCategoria(genEnt);

                    return Ok(vRes);
                }
                catch (Exception e)
                {

                    logger.Error(e);
                    throw;

                }
            }

            else if (genEnt.sOpcion == "03" || genEnt.sOpcion == "04" ||genEnt.sOpcion == "05" )
            {
                try
                {
                    string sResultado = Convert.ToString(objCategoria.BusinessCategoria(genEnt));
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

        #region Almacen

        [HttpPost, Route("Producto")]
        public IActionResult CrudProductos(GeneralEntity genEnt) // fnServProductos
        {


            if (genEnt.sOpcion == "01" || genEnt.sOpcion == "02" || genEnt.sOpcion == "03" ||
                genEnt.sOpcion == "04" || genEnt.sOpcion == "05")
            {
                try
                {
                    var vRes = objProducto.BusinessProducto(genEnt);

                    return Ok(vRes);
                }
                catch (Exception e)
                {

                    logger.Error(e);
                    throw;

                }
            }

            else if (genEnt.sOpcion == "06" || genEnt.sOpcion == "07" || genEnt.sOpcion == "08")
            {
                try
                {
                    string sResultado = Convert.ToString(objProducto.BusinessProducto(genEnt));
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
