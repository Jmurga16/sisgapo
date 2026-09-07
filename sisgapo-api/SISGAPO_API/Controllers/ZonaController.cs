using Business;
using Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NLog;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SISGAPO_API.Controllers
{

    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class ZonaController : Controller
    {
        private readonly ZonaBusiness objZonas;
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        public ZonaController(ZonaBusiness objZonas)
        {
            this.objZonas = objZonas;
        }

        //Obtener todas las zonas
        [HttpGet]
        public async Task<List<ZonaEntity>> LIS_Zonas()
        {
            try
            {
                return await objZonas.LIS_ZonaBusiness();
            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
        }

        //Obtener una para editar
        [Route("editar/{id}")]
        [HttpGet]
        public async Task<List<ZonaEntity>> LIS_ZonaUnico(int id)
        {
            try
            {
                return await objZonas.LIS_ZonaUnicoBusiness(id);
            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
        }

        //Crear zona
        [HttpPost]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> CREATE_Zona(ZonaEntity objZonaEnt)
        {
            try
            {
                if (objZonaEnt == null)
                {
                    return BadRequest(new { cod = "0", mensaje = "Falta el cuerpo de la peticion." });
                }

                return Ok(fnRespuesta(await objZonas.CREATE_ZonaBusiness(objZonaEnt)));
            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
        }

        //Actualizar zona
        [HttpPut]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> UPDATE_Zona(ZonaEntity objZonaEnt)
        {
            try
            {
                if (objZonaEnt == null || objZonaEnt.nIdZona <= 0)
                {
                    return BadRequest(new { cod = "0", mensaje = "Falta el identificador de la zona." });
                }

                return Ok(fnRespuesta(await objZonas.UPDATE_ZonaBusiness(objZonaEnt)));
            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
        }

        //Activar / dar de baja (baja lógica)
        [Route("estado/{id}/{estado}")]
        [HttpPut]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> ESTADO_Zona(int id, bool estado)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest(new { cod = "0", mensaje = "Falta el identificador de la zona." });
                }

                return Ok(fnRespuesta(await objZonas.ESTADO_ZonaBusiness(id, estado)));
            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
        }

        private static object fnRespuesta(string sResultado)
        {
            if (String.IsNullOrWhiteSpace(sResultado))
            {
                return new { cod = "0", mensaje = "La operación no devolvió respuesta." };
            }

            string[] arPartes = sResultado.Split('|');

            return new
            {
                cod = arPartes[0],
                mensaje = arPartes.Length > 1 ? arPartes[1] : ""
            };
        }
    }
}
