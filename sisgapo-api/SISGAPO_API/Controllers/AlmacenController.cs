using Business;
using Entity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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

        AlmacenBusiness objAlmacen = new AlmacenBusiness();
        
        #region Almacen

        [HttpPost]
        public IActionResult CrudAlmacen(GeneralEntity genEnt) // fnServAlmacenes
        {

            if (genEnt.sOpcion == "01" || genEnt.sOpcion == "02" || genEnt.sOpcion == "03" || genEnt.sOpcion == "04")
            {
                try
                {
                    var vRes = objAlmacen.BusinessAlmacen(genEnt);

                    return Ok(vRes);
                }
                catch (Exception)
                {

                    throw;

                }
            }

            else if (genEnt.sOpcion == "05" || genEnt.sOpcion == "06" || genEnt.sOpcion == "07")
            {
                try
                {
                    string[] listaRes;

                    string sResultado = Convert.ToString(objAlmacen.BusinessAlmacen(genEnt));
                    listaRes = sResultado.Split('|');

                    return Ok(new { cod = listaRes[0], mensaje = listaRes[1] });
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

        #endregion



    }
}
