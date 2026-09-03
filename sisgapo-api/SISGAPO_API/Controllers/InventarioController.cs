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
using System.Security.Claims;
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
        private readonly LoteBusiness objLote = new LoteBusiness();
        private readonly MovimientoBusiness objMovimiento = new MovimientoBusiness();

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
                if (!User.IsInRole("1") && !User.IsInRole("2"))
                {
                    return Forbid();
                }

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
                if (!User.IsInRole("1") && !User.IsInRole("2"))
                {
                    return Forbid();
                }

                if (genEnt.sOpcion == "06")
                {
                    fnAgregarUsuario(genEnt);
                }

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

        #region Lote

        [HttpPost, Route("Lote")]
        public IActionResult CrudLotes(GeneralEntity genEnt) // fnServLote
        {

            if (genEnt.sOpcion == "01" || genEnt.sOpcion == "02" || genEnt.sOpcion == "06")
            {
                try
                {
                    var vRes = objLote.BusinessLote(genEnt);

                    return Ok(vRes);
                }
                catch (Exception e)
                {

                    logger.Error(e);
                    throw;

                }
            }

            else if (genEnt.sOpcion == "03" || genEnt.sOpcion == "04" || genEnt.sOpcion == "05")
            {
                //El mantenimiento de lotes es de los mismos roles que el de productos.
                //El Asistente no crea partidas: registra movimientos sobre las que hay.
                if (!User.IsInRole("1") && !User.IsInRole("2"))
                {
                    return Forbid();
                }

                if (genEnt.sOpcion == "03")
                {
                    fnAgregarUsuario(genEnt);
                }

                try
                {
                    string sResultado = Convert.ToString(objLote.BusinessLote(genEnt));
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

        #region Movimiento

        [HttpPost, Route("Movimiento")]
        public IActionResult CrudMovimientos(GeneralEntity genEnt) // fnServMovimiento
        {

            if (genEnt.sOpcion == "01" || genEnt.sOpcion == "03" || genEnt.sOpcion == "04")
            {
                try
                {
                    var vRes = objMovimiento.BusinessMovimiento(genEnt);

                    return Ok(vRes);
                }
                catch (Exception e)
                {

                    logger.Error(e);
                    throw;

                }
            }

            else if (genEnt.sOpcion == "02")
            {
                //Entradas y salidas las registra cualquier rol; el ajuste, que corrige
                //la existencia sin documento que lo respalde, solo el Supervisor.
                if (fnEsAjuste(genEnt) && !User.IsInRole("1") && !User.IsInRole("2"))
                {
                    return Forbid();
                }

                fnAgregarUsuario(genEnt);

                try
                {
                    string sResultado = Convert.ToString(objMovimiento.BusinessMovimiento(genEnt));
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

        private static bool fnEsAjuste(GeneralEntity genEnt)
        {
            if (genEnt.parametros == null || genEnt.parametros.Length < 2)
            {
                return false;
            }

            return String.Equals((genEnt.parametros[1] ?? "").Trim(), "A", StringComparison.OrdinalIgnoreCase);
        }

        //Quien firma un movimiento es quien inició sesión, no lo que mande el
        //formulario: el id sale del token y se añade como último parametro.
        private void fnAgregarUsuario(GeneralEntity genEnt)
        {
            if (genEnt.parametros == null)
            {
                return;
            }

            string sIdUsuario = User.FindFirstValue(ClaimTypes.NameIdentifier);

            genEnt.parametros = genEnt.parametros
                .Concat(new[] { String.IsNullOrEmpty(sIdUsuario) ? "0" : sIdUsuario })
                .ToArray();
        }

        #endregion
    }
}
