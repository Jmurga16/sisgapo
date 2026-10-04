using System;
using System.Linq;

namespace Business
{
    internal static class ParametroDelimitado
    {
        public static string Preparar(string[] parametros, string pParametro, bool exigirParametros)
        {
            if (!String.IsNullOrEmpty(pParametro))
            {
                throw new ArgumentException("pParametro ya no se admite: envia los valores en parametros.");
            }

            if (parametros == null)
            {
                if (exigirParametros)
                {
                    throw new ArgumentException("La operacion requiere parametros estructurados.");
                }

                return String.Empty;
            }

            if (parametros.Any(valor => valor != null && valor.Contains('|')))
            {
                throw new ArgumentException("Los datos no pueden contener el caracter |.");
            }

            return String.Join("|", parametros);
        }
    }
}
