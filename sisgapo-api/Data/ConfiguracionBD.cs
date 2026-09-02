using Microsoft.Extensions.Configuration;
using System;
using System.IO;

namespace Data
{
    public static class ConfiguracionBD
    {
        private const string sVariableEntorno = "SISGAPO_CONNECTION_STRING";

        private static readonly Lazy<string> oCadena = new Lazy<string>(fnResolverCadena);

        public static string sCadenaConexion => oCadena.Value;

        private static string sEntorno =>
            Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";

        private static string fnResolverCadena()
        {
            string sCadena = Environment.GetEnvironmentVariable(sVariableEntorno);

            if (String.IsNullOrWhiteSpace(sCadena))
            {
                IConfiguration configuration = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
                    .AddJsonFile($"appsettings.{sEntorno}.json", optional: true, reloadOnChange: false)
                    .Build();

                sCadena = configuration["ConnectionStrings:connectionString"];
            }

            if (String.IsNullOrWhiteSpace(sCadena))
            {
                throw new InvalidOperationException(
                    "No hay cadena de conexión configurada. En " + sEntorno + " define la " +
                    "variable de entorno " + sVariableEntorno + ". En Development se usa la " +
                    "cadena de appsettings.Development.json, que apunta a docker compose.");
            }

            return sCadena;
        }
    }
}
