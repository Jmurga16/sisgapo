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
               
    
    }

}
