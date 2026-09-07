using Entity;
using System;
using System.Security.Claims;

namespace SISGAPO_API.Seguridad
{
    //Entradas y salidas las registra cualquier rol; el ajuste, que corrige la existencia
    //sin documento que lo respalde, solo el Administrador o el Supervisor.
    public static class PoliticaMovimiento
    {
        private const string sRolAdministrador = "1";
        private const string sRolSupervisor = "2";

        public static bool fnEsAjuste(string[] arParametros)
        {
            if (arParametros == null || arParametros.Length < TipoMovimiento.nPosicion)
            {
                return false;
            }

            string sTipo = (arParametros[TipoMovimiento.nPosicion - 1] ?? "").Trim();

            return String.Equals(sTipo, TipoMovimiento.Ajuste, StringComparison.OrdinalIgnoreCase);
        }

        public static bool fnPuedeRegistrar(ClaimsPrincipal oUsuario, string[] arParametros)
        {
            if (!fnEsAjuste(arParametros))
            {
                return true;
            }

            return oUsuario != null
                && (oUsuario.IsInRole(sRolAdministrador) || oUsuario.IsInRole(sRolSupervisor));
        }
    }
}
