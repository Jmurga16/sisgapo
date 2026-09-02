using Business;
using Data;
using Entity;
using Xunit;

namespace Test
{
    public class LoginBusinessTests
    {
        [Fact]
        public void CredencialesCorrectasDevuelvenUsuarioSinHash()
        {
            CredencialEntity credencial = new CredencialEntity
            {
                nIdUsuario = 1,
                nIdRol = 1,
                sNombreUsuario = "admin",
                sNombrePersona = "Administrador",
                sContrasenia = LoginBusiness.fnGenerarHash("123456")
            };
            LoginBusiness negocio = new LoginBusiness(new LoginDataFalso(credencial));

            CredencialEntity resultado = negocio.fnVerificarCredenciales(new LoginEntity
            {
                sNombreUsuario = " admin ",
                sContrasenia = "123456"
            });

            Assert.NotNull(resultado);
            Assert.Equal("admin", resultado.sNombreUsuario);
            Assert.Null(resultado.sContrasenia);
        }

        [Fact]
        public void UsuarioDadoDeBajaNoPuedeIngresar()
        {
            LoginBusiness negocio = new LoginBusiness(new LoginDataFalso(null));

            CredencialEntity resultado = negocio.fnVerificarCredenciales(new LoginEntity
            {
                sNombreUsuario = "jorge.salazar",
                sContrasenia = "123456"
            });

            Assert.Null(resultado);
        }

        [Fact]
        public void HashCorruptoRechazaElAcceso()
        {
            CredencialEntity credencial = new CredencialEntity
            {
                sNombreUsuario = "admin",
                sContrasenia = "hash-invalido"
            };
            LoginBusiness negocio = new LoginBusiness(new LoginDataFalso(credencial));

            CredencialEntity resultado = negocio.fnVerificarCredenciales(new LoginEntity
            {
                sNombreUsuario = "admin",
                sContrasenia = "123456"
            });

            Assert.Null(resultado);
        }

        private sealed class LoginDataFalso : ILoginData
        {
            private readonly CredencialEntity credencial;

            public LoginDataFalso(CredencialEntity credencial)
            {
                this.credencial = credencial;
            }

            public CredencialEntity ObtenerPorUsuario(string sNombreUsuario)
            {
                return credencial;
            }
        }
    }
}
