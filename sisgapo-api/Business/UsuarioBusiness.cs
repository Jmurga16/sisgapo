using Data;
using Entity;
using NLog;
using System;
using System.Collections.Generic;

namespace Business
{
    public class UsuarioBusiness
    {
        private readonly UsuarioData usuarioData = new UsuarioData();
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        public object LIS_UsuarioBusiness(UsuarioEntity erp)
        {
            try
            {

                return usuarioData.LIS_UsuarioData(erp);

            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;

            }
        }
               
    
    }

}
