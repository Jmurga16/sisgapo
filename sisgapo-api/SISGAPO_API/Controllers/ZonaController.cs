using Business;
using Entity;
using Microsoft.AspNetCore.Mvc;
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
        ZonaBusiness objZonas = new ZonaBusiness();
        List<ZonaEntity> lstZonas = new List<ZonaEntity>();
        string strZona = "";
       

        //Obtener Todos los zonas
        [HttpGet]
        public List<ZonaEntity> LIS_Zonas()
        {
           
            try
            {
                lstZonas = objZonas.LIS_ZonaBusiness();

            }
            catch (Exception)
            {
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
            catch (Exception)
            {
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
            catch (Exception)
            {
                throw;
            }
            return strZona;
        }
    }
}
