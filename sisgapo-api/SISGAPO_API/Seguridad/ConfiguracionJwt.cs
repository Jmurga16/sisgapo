using Microsoft.Extensions.Configuration;
using System;
using System.IO;

namespace SISGAPO_API.Seguridad
{

    public static class ConfiguracionJwt
    {
        private const string sVariableEntornoClave = "SISGAPO_JWT_KEY";

        //HMAC-SHA256 firma con 256 bits.
        private const int nLongitudMinimaClave = 32;

        private static readonly Lazy<IConfiguration> oConfiguracion =
            new Lazy<IConfiguration>(fnCargarConfiguracion);

        private static readonly Lazy<string> oClave = new Lazy<string>(fnResolverClave);

        public static string sClave => oClave.Value;

        public static string sEmisor => oConfiguracion.Value["Jwt:Emisor"] ?? "SISGAPO";

        public static string sAudiencia => oConfiguracion.Value["Jwt:Audiencia"] ?? "SISGAPO";

        public static int nMinutosVigencia
        {
            get
            {
                string sValor = oConfiguracion.Value["Jwt:MinutosVigencia"];

                return Int32.TryParse(sValor, out int nMinutos) && nMinutos > 0
                    ? nMinutos
                    : 480;
            }
        }

        private static string sEntorno =>
            Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";

        private static IConfiguration fnCargarConfiguracion()
        {
            return new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
                .AddJsonFile($"appsettings.{sEntorno}.json", optional: true, reloadOnChange: false)
                .AddEnvironmentVariables()
                .Build();
        }

        private static string fnResolverClave()
        {
            string sClaveResuelta = Environment.GetEnvironmentVariable(sVariableEntornoClave);

            if (String.IsNullOrWhiteSpace(sClaveResuelta))
            {
                sClaveResuelta = oConfiguracion.Value["Jwt:Clave"];
            }

            if (String.IsNullOrWhiteSpace(sClaveResuelta))
            {
                throw new InvalidOperationException(
                    "No hay clave de firma configurada para los tokens. En " + sEntorno +
                    " define la variable de entorno " + sVariableEntornoClave +
                    " con al menos " + nLongitudMinimaClave + " caracteres. " +
                    "En Development se usa la clave de appsettings.Development.json.");
            }

            if (sClaveResuelta.Length < nLongitudMinimaClave)
            {
                throw new InvalidOperationException(
                    "La clave de firma tiene " + sClaveResuelta.Length + " caracteres y necesita " +
                    "al menos " + nLongitudMinimaClave + ".");
            }

            return sClaveResuelta;
        }
    }
}
