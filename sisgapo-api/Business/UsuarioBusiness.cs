using Data;
using Entity;
using System;
using System.Collections.Generic;

namespace Business
{
    public class UsuarioBusiness
    {
        UsuarioData usuarioData = new UsuarioData();

        public object LIS_UsuarioBusiness(UsuarioEntity erp)
        {
            try
            {

                return usuarioData.LIS_UsuarioData(erp);

            }
            catch (Exception)
            {

                throw;

            }
        }

        #region Comentarios
        /*
        public List<UsuarioEntity> LIS_UsuarioFiltroBusiness(UsuarioEntity objUsuariosEnt)
        {
            try 
            { 

                return usuarioData.LIS_UsuarioFiltroData(objUsuariosEnt);

            }
            catch (Exception)
            {

                throw;

            }
}

        public List<UsuarioEntity> LIS_UsuarioUnicoBusiness(int id_usuario)
        {
            try
            {

                return usuarioData.LIS_UsuarioUnicoData(id_usuario);

            }
            catch (Exception)
            {

                throw;

            }

        }

        public String CREATE_UsuarioBusiness(UsuarioEntity objUsuariosEnt)
        {
            try
            {
                                
                return usuarioData.CREATE_UsuarioData(objUsuariosEnt);

            }
            catch (Exception)
            {

                throw;
            }
            
            
        }

        public String UPDATE_UsuarioBusiness(int id_usuario, UsuarioEntity objUsuariosEnt)
        {
            try
            {

                return usuarioData.UPDATE_UsuarioData(id_usuario, objUsuariosEnt);

            }
            catch (Exception)
            {

                throw;

            }
            
        }

        public bool DELETE_UsuarioBusiness(int id_usuario)
        {
            try
            {

                return usuarioData.DELETE_UsuarioData(id_usuario);

            }
            catch (Exception)
            {

                throw;

            }
            
        }
         */
        #endregion
    
    }

}
