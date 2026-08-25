using Microsoft.Extensions.Configuration;
using System;
using System.IO;

namespace Data
{
    /// <summary>
    /// Resuelve la cadena de conexión una sola vez por proceso.
    ///
    /// Orden de precedencia:
    ///   1. Variable de entorno SISGAPO_CONNECTION_STRING
    ///   2. Clave ConnectionStrings:connectionString de appsettings.json
    ///
    /// La cadena real no se versiona: en local va en la variable de entorno
    /// (o en dotnet user-secrets) y en despliegue en la configuración del servicio.
    /// appsettings.json solo conserva un marcador de posición.
    /// </summary>
    public static class ConfiguracionBD
    {
        private const string sVariableEntorno = "SISGAPO_CONNECTION_STRING";

        private static readonly Lazy<string> oCadena = new Lazy<string>(fnResolverCadena);

        public static string sCadenaConexion => oCadena.Value;

        private static string fnResolverCadena()
        {
            string sCadena = Environment.GetEnvironmentVariable(sVariableEntorno);

            if (String.IsNullOrWhiteSpace(sCadena))
            {
                IConfiguration configuration = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
                    .Build();

                sCadena = configuration["ConnectionStrings:connectionString"];
            }

            //Fallar aquí y con un mensaje claro, en vez de dejar la cadena nula
            //y que el error salga después como un NullReferenceException sin relación.
            if (String.IsNullOrWhiteSpace(sCadena))
            {
                throw new InvalidOperationException(
                    "No hay cadena de conexión configurada. Define la variable de entorno " +
                    sVariableEntorno + " o la clave ConnectionStrings:connectionString en appsettings.json.");
            }

            return sCadena;
        }
    }
}
