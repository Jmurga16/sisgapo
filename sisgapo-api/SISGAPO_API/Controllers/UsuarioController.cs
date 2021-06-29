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
    public class UsuarioController : Controller
    {
        UsuarioBusiness objUsuarios = new UsuarioBusiness();

        //Obtener Todos los usuarios
        [Route("getAll")]
        [HttpPost]
        public IActionResult LIS_Usuarios(UsuarioEntity erp)
        {
            List<UsuarioEntity> lstUsuarios = new List<UsuarioEntity>();
            if (erp.sOpcion == "01" || erp.sOpcion == "02" || erp.sOpcion == "03")
            { 
                try
                {
                    var result = objUsuarios.LIS_UsuarioBusiness(erp);

                    return Ok(result);

                }
                catch (Exception)
                {
                    throw;
                }
            }

            else if (erp.sOpcion == "04" || erp.sOpcion == "05" || erp.sOpcion == "06")
            {
                try
                {
                    //string[] lista;

                    string result = Convert.ToString(objUsuarios.LIS_UsuarioBusiness(erp));

                    //lista = result.Split('|');

                    return Ok(new { mensaje = "Ok"});
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

        #region Comentar
        /*

        //Obtener uno para editar
        [Route("editar/{id}")]
        [HttpGet]
        public List<UsuarioEntity> LIS_UsuarioUnico(int id)
        {
            List<UsuarioEntity> lstUsuarios = new List<UsuarioEntity>();
            try
            {
                lstUsuarios = objUsuarios.LIS_UsuarioUnicoBusiness(id);

            }
            catch (Exception)
            {
                throw;
            }
            return lstUsuarios;
        }

        //Obtener con filtros
        [Route("filtrar")]
        [HttpPost]
        public List<UsuarioEntity> LIS_UsuariosFiltro(UsuarioEntity objUsuarioEnt)
        {
            List<UsuarioEntity> lstUsuarios = new List<UsuarioEntity>();
            try
            {
                lstUsuarios = objUsuarios.LIS_UsuarioFiltroBusiness(objUsuarioEnt);

            }
            catch (Exception)
            {
                throw;
            }
            return lstUsuarios;
        }

        //Crear Usuarios
        [HttpPost]
        public String CREATE_Usuario(UsuarioEntity objUsuarioEnt)
        {

            //UsuarioEntity libEnt = new UsuarioEntity();
            string strUsuario = "";

            try
            {
                strUsuario = objUsuarios.CREATE_UsuarioBusiness(objUsuarioEnt);
            }
            catch (Exception)
            {
                throw;
            }
            return strUsuario;
        }

        //Editar Usuario
        [Route("{id}")]
        [HttpPut]
        public String UPDATE_Usuario(int id, UsuarioEntity objUsuarioEnt)
        {

            //UsuarioEntity libEnt = new UsuarioEntity();
            string strGame = "";

            try
            {
                strGame = objUsuarios.UPDATE_UsuarioBusiness(id, objUsuarioEnt);

            }
            catch (Exception)
            {
                throw;
            }
            return strGame;
        }

        //Eliminar Usuario
        [Route("{id}")]
        [HttpDelete]
        public bool DELETE_Usuario(int id)
        {

            // UsuarioEntity libEnt = new UsuarioEntity();
            bool bRes;

            try
            {
                bRes = objUsuarios.DELETE_UsuarioBusiness(id);

            }
            catch (Exception)
            {
                throw;
            }
            return bRes;
        }

        */
        #endregion

    }
}
