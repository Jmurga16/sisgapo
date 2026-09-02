using Business;
using Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NLog;
using System;
using System.Collections.Generic;

namespace SISGAPO_API.Controllers
{

    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class ZonaController : Controller
    {
        private readonly ZonaBusiness objZonas = new ZonaBusiness();
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        //Obtener todas las zonas
        [HttpGet]
        public List<ZonaEntity> LIS_Zonas()
        {
            try
            {
                return objZonas.LIS_ZonaBusiness();
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
        public List<ZonaEntity> LIS_ZonaUnico(int id)
        {
            try
            {
                return objZonas.LIS_ZonaUnicoBusiness(id);
            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
        }

        //Crear zona
        [HttpPost]
        [Authorize(Roles = "1,2")]
        public IActionResult CREATE_Zona(ZonaEntity objZonaEnt)
        {
            try
            {
                if (String.IsNullOrWhiteSpace(objZonaEnt?.sNombre))
                {
                    return BadRequest(new { cod = "0", mensaje = "El nombre de la zona es obligatorio." });
                }

                return Ok(fnRespuesta(objZonas.CREATE_ZonaBusiness(objZonaEnt)));
            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
        }

        //Actualizar zona
        [HttpPut]
        [Authorize(Roles = "1,2")]
        public IActionResult UPDATE_Zona(ZonaEntity objZonaEnt)
        {
            try
            {
                if (objZonaEnt == null || objZonaEnt.nIdZona <= 0)
                {
                    return BadRequest(new { cod = "0", mensaje = "Falta el identificador de la zona." });
                }

                if (String.IsNullOrWhiteSpace(objZonaEnt.sNombre))
                {
                    return BadRequest(new { cod = "0", mensaje = "El nombre de la zona es obligatorio." });
                }

                return Ok(fnRespuesta(objZonas.UPDATE_ZonaBusiness(objZonaEnt)));
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
        [Authorize(Roles = "1,2")]
        public IActionResult ESTADO_Zona(int id, bool estado)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest(new { cod = "0", mensaje = "Falta el identificador de la zona." });
                }

                return Ok(fnRespuesta(objZonas.ESTADO_ZonaBusiness(id, estado)));
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
