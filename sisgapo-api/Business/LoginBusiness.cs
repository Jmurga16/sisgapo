using Data;
using Entity;
using NLog;
using System;

namespace Business
{
    public class LoginBusiness
    {
        private readonly LoginData loginData = new LoginData();
        private readonly Logger logger = LogManager.GetCurrentClassLogger();
        
        public CredencialEntity fnVerificarCredenciales(LoginEntity logEnt)
        {
            try
            {
                if (logEnt == null
                    || String.IsNullOrWhiteSpace(logEnt.sNombreUsuario)
                    || String.IsNullOrEmpty(logEnt.sContrasenia))
                {
                    return null;
                }

                CredencialEntity oCredencial = loginData.ObtenerPorUsuario(logEnt.sNombreUsuario.Trim());

                if (oCredencial == null || String.IsNullOrWhiteSpace(oCredencial.sContrasenia))
                {
                    return null;
                }

                if (!fnComprobarHash(logEnt.sContrasenia, oCredencial.sContrasenia))
                {
                    return null;
                }

                oCredencial.sContrasenia = null;

                return oCredencial;
            }
            catch (Exception e)
            {
                logger.Error(e);
                throw;
            }
        }

        public static string fnGenerarHash(string sContrasenia)
        {
            return BCrypt.Net.BCrypt.HashPassword(sContrasenia, workFactor: 11);
        }

        private bool fnComprobarHash(string sContrasenia, string sHash)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(sContrasenia, sHash);
            }
            catch (BCrypt.Net.SaltParseException)
            {
                //Base sembrada con un seed anterior: las contrasenias estan en claro.
                logger.Warn("La contrasenia guardada no tiene formato bcrypt.");
                return false;
            }
        }
    }
}
