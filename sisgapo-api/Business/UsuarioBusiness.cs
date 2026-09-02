using Data;
using Entity;
using NLog;
using System;
using System.Globalization;
using System.Text.RegularExpressions;

namespace Business
{
    public class UsuarioBusiness
    {
        private readonly IUsuarioData usuarioData;
        private readonly Logger logger = LogManager.GetCurrentClassLogger();

        private const int nPosicionContrasenia = 10;

        private const char cSeparador = '|';

        public UsuarioBusiness() : this(new UsuarioData())
        {
        }

        public UsuarioBusiness(IUsuarioData usuarioData)
        {
            this.usuarioData = usuarioData ?? throw new ArgumentNullException(nameof(usuarioData));
        }

        public object LIS_UsuarioBusiness(UsuarioEntity erp)
        {
            try
            {
                bool bEscritura = erp != null && (erp.sOpcion == "04" || erp.sOpcion == "05" || erp.sOpcion == "06");
                erp.pParametro = ParametroDelimitado.Preparar(erp.parametros, erp.pParametro, bEscritura);

                if (erp != null && (erp.sOpcion == "04" || erp.sOpcion == "05"))
                {
                    fnValidarDatosUsuario(erp.pParametro, erp.sOpcion == "04");
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

        private static void fnValidarDatosUsuario(string pParametro, bool bEsAlta)
        {
            string[] arValores = (pParametro ?? String.Empty).Split(cSeparador);
            int nCantidadEsperada = bEsAlta ? 10 : 11;

            if (arValores.Length != nCantidadEsperada)
            {
                throw new ArgumentException("La cantidad de datos del usuario no es válida.");
            }

            if (!Int32.TryParse(arValores[2], out int nTipoDocumento)
                || nTipoDocumento < 1
                || nTipoDocumento > 3)
            {
                throw new ArgumentException("El tipo de documento no es válido.");
            }

            string sDocumento = arValores[3] ?? String.Empty;
            bool bDocumentoValido = nTipoDocumento == 1
                ? Regex.IsMatch(sDocumento, @"^\d{8}$")
                : Regex.IsMatch(sDocumento, @"^[A-Za-z0-9]{6,15}$");

            if (!bDocumentoValido)
            {
                string sMensaje = nTipoDocumento == 1
                    ? "El DNI debe tener 8 dígitos."
                    : "El documento debe tener entre 6 y 15 caracteres alfanuméricos.";
                throw new ArgumentException(sMensaje);
            }

            if (!Regex.IsMatch(arValores[7] ?? String.Empty, @"^9\d{8}$"))
            {
                throw new ArgumentException("El teléfono debe tener 9 dígitos y empezar con 9.");
            }

            if (!DateTime.TryParseExact(
                arValores[8],
                "yyyy-MM-dd",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out DateTime dFechaNacimiento)
                || dFechaNacimiento.Date > DateTime.Today.AddYears(-18))
            {
                throw new ArgumentException("El usuario debe ser mayor de edad.");
            }

            string sContrasenia = arValores[nPosicionContrasenia - 1] ?? String.Empty;

            if ((bEsAlta || sContrasenia.Length > 0) && sContrasenia.Length < 8)
            {
                throw new ArgumentException("La contraseña debe tener al menos 8 caracteres.");
            }
        }
    }
}
