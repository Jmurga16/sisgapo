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
    [Route("ClientesService")]
    [ApiController]
    public class ClienteController : Controller
    {
        private readonly ClienteBusiness objCliente = new ClienteBusiness();
        
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
      
        #region Cliente

        [HttpPost]
        public IActionResult CrudCliente(GeneralEntity genEnt) // fnServCliente
        {

            if (genEnt.sOpcion == "01" || genEnt.sOpcion == "02")
            {
                try
                {
                    var vRes = objCliente.BusinessCliente(genEnt);

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
                try
                {
                    string[] listaRes;

                    string sResultado = Convert.ToString(objCliente.BusinessCliente(genEnt));
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
