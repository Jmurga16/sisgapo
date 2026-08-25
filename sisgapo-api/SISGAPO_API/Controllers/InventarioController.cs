using Business;
using Entity;
using Microsoft.AspNetCore.Cors;
//using System.Web.Http.Cors;
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
    //[EnableCors(origins: "", headers: "", methods: "*")]
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
                //Antes esto era 'return null', que ASP.NET Core traduce a 204 No Content
                //con cuerpo vacio: el frontend recibia null y fallaba al leer sus
                //propiedades, sin mensaje para el usuario. Ver 06-hallazgos.md C-08.
                return BadRequest(new { cod = "0", mensaje = $"Opcion no soportada: {genEnt.sOpcion}" });
            }

        }

        #endregion

        #region Almacen

        [HttpPost, Route("Producto")]
        public IActionResult CrudProductos(GeneralEntity genEnt) // fnServProductos
        {

            //Ojo con los rangos: aqui estaban copiados de AlmacenController sin
            //ajustar. En Productos la 05 es una LECTURA (obtener por id) y la 08 es
            //una ESCRITURA. El resultado era que cargar un producto para editarlo
            //devolvia siempre un 500 (se intentaba hacer Split de una List<T>), y
            //eliminar un producto caia en el 'else' y no llegaba a ejecutarse nunca.
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
                //Antes esto era 'return null', que ASP.NET Core traduce a 204 No Content
                //con cuerpo vacio: el frontend recibia null y fallaba al leer sus
                //propiedades, sin mensaje para el usuario. Ver 06-hallazgos.md C-08.
                return BadRequest(new { cod = "0", mensaje = $"Opcion no soportada: {genEnt.sOpcion}" });
            }

        }

        #endregion
    }
}
