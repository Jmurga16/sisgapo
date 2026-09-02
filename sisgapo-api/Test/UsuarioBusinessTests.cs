using System;
using Business;
using Data;
using Entity;
using Xunit;

namespace Test
{
    public class UsuarioBusinessTests
    {
        [Fact]
        public void NuevoUsuarioGuardaLaContraseniaConBcrypt()
        {
            UsuarioDataFalso datos = new UsuarioDataFalso();
            UsuarioBusiness negocio = new UsuarioBusiness(datos);
            UsuarioEntity usuario = new UsuarioEntity
            {
                sOpcion = "04",
                parametros = new[]
                {
                    "Ana", "Torres", "1", "12345678", "F", "2",
                    "Lima", "999999999", "2000-01-01", "secreto"
                }
            };

            negocio.LIS_UsuarioBusiness(usuario);

            string hash = datos.UltimoParametro.Split('|')[9];
            Assert.NotEqual("secreto", hash);
            Assert.True(BCrypt.Net.BCrypt.Verify("secreto", hash));
        }

        [Fact]
        public void EdicionSinContraseniaConservaElCampoVacio()
        {
            UsuarioDataFalso datos = new UsuarioDataFalso();
            UsuarioBusiness negocio = new UsuarioBusiness(datos);
            UsuarioEntity usuario = new UsuarioEntity
            {
                sOpcion = "05",
                parametros = new[]
                {
                    "Ana", "Torres", "1", "12345678", "F", "2",
                    "Lima", "999999999", "2000-01-01", "", "4"
                }
            };

            negocio.LIS_UsuarioBusiness(usuario);

            Assert.Equal(String.Empty, datos.UltimoParametro.Split('|')[9]);
        }

        [Fact]
        public void DelimitadorEnUnDatoEsRechazado()
        {
            UsuarioBusiness negocio = new UsuarioBusiness(new UsuarioDataFalso());
            UsuarioEntity usuario = new UsuarioEntity
            {
                sOpcion = "04",
                parametros = new[]
                {
                    "Ana|Maria", "Torres", "1", "12345678", "F", "2",
                    "Lima", "999999999", "2000-01-01", "secreto"
                }
            };

            ArgumentException error = Assert.Throws<ArgumentException>(() => negocio.LIS_UsuarioBusiness(usuario));
            Assert.Contains("no pueden contener", error.Message);
        }

        private sealed class UsuarioDataFalso : IUsuarioData
        {
            public string UltimoParametro { get; private set; }

            public object LIS_UsuarioData(UsuarioEntity erp)
            {
                UltimoParametro = erp.pParametro;
                return "OK";
            }
        }
    }
}
