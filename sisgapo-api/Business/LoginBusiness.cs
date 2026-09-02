using Data;
using Entity;
using NLog;
using System;

namespace Business
{
    public class LoginBusiness
    {
        private readonly ILoginData loginData;
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        public LoginBusiness() : this(new LoginData())
        {
        }

        public LoginBusiness(ILoginData loginData)
        {
            this.loginData = loginData ?? throw new ArgumentNullException(nameof(loginData));
        }
        
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
                logger.Warn("La contrasenia guardada no tiene formato bcrypt.");
                return false;
            }
        }
    }
}
