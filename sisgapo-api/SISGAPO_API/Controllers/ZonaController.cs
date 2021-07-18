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
    [ApiController]
    [Route("api/[controller]")]
    public class ZonaController : Controller
    {
        private readonly ZonaBusiness objZonas = new ZonaBusiness();
        List<ZonaEntity> lstZonas = new List<ZonaEntity>();
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        string strZona = "";
       

        //Obtener Todos los zonas
        [HttpGet]
        public List<ZonaEntity> LIS_Zonas()
        {
           
            try
            {
                lstZonas = objZonas.LIS_ZonaBusiness();

            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
            return lstZonas;
        }

        //Obtener uno para editar
        [Route("editar/{id}")]
        [HttpGet]
        public List<ZonaEntity> LIS_ZonaUnico(int id)
        {            
            try
            {
                lstZonas = objZonas.LIS_ZonaUnicoBusiness(id);

            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
            return lstZonas;
        }

        //Crear Zonas
        [HttpPost]
        public String CREATE_Zona(ZonaEntity objZonaEnt)
        {
            
            try
            {
                strZona = objZonas.CREATE_ZonaBusiness(objZonaEnt);
            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
            return strZona;
        }
    }
}
