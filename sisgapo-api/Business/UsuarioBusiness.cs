using Data;
using Entity;
using NLog;
using System;

namespace Business
{
    public class UsuarioBusiness
    {
        private readonly UsuarioData usuarioData = new UsuarioData();
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        //Posicion de la contrasenia dentro de pParametro en las opciones 04 y 05.
        private const int nPosicionContrasenia = 10;

        private const char cSeparador = '|';

        public object LIS_UsuarioBusiness(UsuarioEntity erp)
        {
            try
            {
                if (erp != null && (erp.sOpcion == "04" || erp.sOpcion == "05"))
                {
                    erp.pParametro = fnHashearContrasenia(erp.pParametro);
                }

                return usuarioData.LIS_UsuarioData(erp);
            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
        }
        
        private string fnHashearContrasenia(string pParametro)
        {
            if (String.IsNullOrEmpty(pParametro))
            {
                return pParametro;
            }

            string[] arValores = pParametro.Split(cSeparador);

            if (arValores.Length < nPosicionContrasenia)
            {
                logger.Warn("pParametro llego con {0} valores y se esperaban al menos {1}.",
                            arValores.Length, nPosicionContrasenia);
                return pParametro;
            }

            string sContrasenia = arValores[nPosicionContrasenia - 1];

            if (String.IsNullOrWhiteSpace(sContrasenia))
            {
                return pParametro;
            }

            arValores[nPosicionContrasenia - 1] = LoginBusiness.fnGenerarHash(sContrasenia);

            return String.Join(cSeparador.ToString(), arValores);
        }
    }
}
