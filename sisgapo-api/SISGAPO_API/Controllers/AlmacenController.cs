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
                    string[] listaRes;

                    string sResultado = Convert.ToString(objInventario.BusinessAlmacen(genEnt));
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
