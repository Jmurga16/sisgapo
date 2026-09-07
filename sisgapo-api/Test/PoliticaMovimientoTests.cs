using System.Collections.Generic;
using System.Security.Claims;
using Business;
using Entity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SISGAPO_API.Controllers;
using SISGAPO_API.Seguridad;
using Xunit;
using System.Threading.Tasks;

namespace Test
{
    public class PoliticaMovimientoTests
    {
        [Theory]
        [InlineData(TipoMovimiento.Ajuste, true)]
        [InlineData("a", true)]
        [InlineData(TipoMovimiento.Entrada, false)]
        [InlineData(TipoMovimiento.Salida, false)]
        public void ElAjusteSeReconocePorLaSegundaPosicion(string sTipo, bool bEsperado)
        {
            Assert.Equal(bEsperado, PoliticaMovimiento.fnEsAjuste(new[] { "1", sTipo, "10", "Motivo" }));
        }

        [Fact]
        public void SinParametrosSuficientesNoSeTomaPorAjuste()
        {
            Assert.False(PoliticaMovimiento.fnEsAjuste(null));
            Assert.False(PoliticaMovimiento.fnEsAjuste(new[] { "1" }));
        }

        [Theory]
        [InlineData("1", true)]
        [InlineData("2", true)]
        [InlineData("3", false)]
        public void SoloAdministradorYSupervisorAjustanLaExistencia(string sRol, bool bPermitido)
        {
            string[] arAjuste = { "1", TipoMovimiento.Ajuste, "10", "Inventario fisico" };

            Assert.Equal(bPermitido, PoliticaMovimiento.fnPuedeRegistrar(fnUsuario(sRol), arAjuste));
        }

        [Fact]
        public void CualquierRolRegistraEntradasYSalidas()
        {
            Assert.True(PoliticaMovimiento.fnPuedeRegistrar(
                fnUsuario("3"), new[] { "1", TipoMovimiento.Entrada, "10", "Compra" }));
            Assert.True(PoliticaMovimiento.fnPuedeRegistrar(
                fnUsuario("3"), new[] { "1", TipoMovimiento.Salida, "10", "Despacho" }));
        }

        [Fact]
        public async Task ElControllerDevuelveForbidSiUnAsistenteIntentaUnAjuste()
        {
            InventarioController oController = new InventarioController(
                new CategoriaBusiness(), new ProductoBusiness(), new LoteBusiness(), new MovimientoBusiness())
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext { User = fnUsuario("3") }
                }
            };

            GeneralEntity oPeticion = new GeneralEntity
            {
                sOpcion = "02",
                parametros = new[] { "1", TipoMovimiento.Ajuste, "10", "Inventario fisico" }
            };

            Assert.IsType<ForbidResult>(await oController.CrudMovimientos(oPeticion));
        }

        private static ClaimsPrincipal fnUsuario(string sRol)
        {
            List<Claim> lstClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, "7"),
                new Claim(ClaimTypes.Role, sRol)
            };

            return new ClaimsPrincipal(new ClaimsIdentity(lstClaims, "Prueba"));
        }
    }
}
