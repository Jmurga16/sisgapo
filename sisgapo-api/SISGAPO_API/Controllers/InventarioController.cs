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
    [Route("InventarioService")]
    [ApiController]
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
                    string[] listaRes;

                    string sResultado = Convert.ToString(objCategoria.BusinessCategoria(genEnt));
                    listaRes = sResultado.Split('|');

                    return Ok(new { cod = listaRes[0], mensaje = listaRes[1] });
                }
                catch (Exception e)
                {

                    logger.Error(e);
                    throw;

                }
            }

            else
            {
                return null;
            }

        }

        #endregion

        #region Almacen

        [HttpPost, Route("Producto")]
        public IActionResult CrudProductos(GeneralEntity genEnt) // fnServProductos
        {

            if (genEnt.sOpcion == "01" || genEnt.sOpcion == "02" || genEnt.sOpcion == "03" || genEnt.sOpcion == "04")
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

            else if (genEnt.sOpcion == "05" || genEnt.sOpcion == "06" || genEnt.sOpcion == "07")
            {
                try
                {
                    string[] listaRes;

                    string sResultado = Convert.ToString(objProducto.BusinessProducto(genEnt));
                    listaRes = sResultado.Split('|');

                    return Ok(new { cod = listaRes[0], mensaje = listaRes[1] });
                }
                catch (Exception e)
                {

                    logger.Error(e);
                    throw;

                }
            }

            else
            {
                return null;
            }

        }

        #endregion
    }
}
