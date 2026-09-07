using System;
using Business;
using Data;
using Entity;
using Xunit;
using System.Threading.Tasks;

namespace Test
{
    public class UsuarioBusinessTests
    {
        [Fact]
        public async Task NuevoUsuarioGuardaLaContraseniaConBcrypt()
        {
            UsuarioDataFalso datos = new UsuarioDataFalso();
            UsuarioBusiness negocio = new UsuarioBusiness(datos);
            GeneralEntity usuario = new GeneralEntity
            {
                sOpcion = "04",
                parametros = new[]
                {
                    "Ana", "Torres", "1", "12345678", "F", "2",
                    "Lima", "999999999", "2000-01-01", "secreto8"
                }
            };

            await negocio.LIS_UsuarioBusiness(usuario);

            string hash = datos.UltimoParametro.Split('|')[9];
            Assert.NotEqual("secreto8", hash);
            Assert.True(BCrypt.Net.BCrypt.Verify("secreto8", hash));
        }

        [Fact]
        public async Task EdicionSinContraseniaConservaElCampoVacio()
        {
            UsuarioDataFalso datos = new UsuarioDataFalso();
            UsuarioBusiness negocio = new UsuarioBusiness(datos);
            GeneralEntity usuario = new GeneralEntity
            {
                sOpcion = "05",
                parametros = new[]
                {
                    "Ana", "Torres", "1", "12345678", "F", "2",
                    "Lima", "999999999", "2000-01-01", "", "4"
                }
            };

            await negocio.LIS_UsuarioBusiness(usuario);

            Assert.Equal(String.Empty, datos.UltimoParametro.Split('|')[9]);
        }

        [Fact]
        public async Task DelimitadorEnUnDatoEsRechazado()
        {
            UsuarioBusiness negocio = new UsuarioBusiness(new UsuarioDataFalso());
            GeneralEntity usuario = new GeneralEntity
            {
                sOpcion = "04",
                parametros = new[]
                {
                    "Ana|Maria", "Torres", "1", "12345678", "F", "2",
                    "Lima", "999999999", "2000-01-01", "secreto8"
                }
            };

            ArgumentException error = await Assert.ThrowsAsync<ArgumentException>(() => negocio.LIS_UsuarioBusiness(usuario));
            Assert.Contains("no pueden contener", error.Message);
        }

        [Fact]
        public async Task ContraseniaCortaEsRechazada()
        {
            UsuarioBusiness negocio = new UsuarioBusiness(new UsuarioDataFalso());
            GeneralEntity usuario = new GeneralEntity
            {
                sOpcion = "04",
                parametros = new[]
                {
                    "Ana", "Torres", "1", "12345678", "F", "2",
                    "Lima", "999999999", "2000-01-01", "corta"
                }
            };

            ArgumentException error = await Assert.ThrowsAsync<ArgumentException>(() => negocio.LIS_UsuarioBusiness(usuario));
            Assert.Contains("al menos 8", error.Message);
        }

        [Fact]
        public async Task UsuarioMenorDeEdadEsRechazado()
        {
            UsuarioBusiness negocio = new UsuarioBusiness(new UsuarioDataFalso());
            GeneralEntity usuario = new GeneralEntity
            {
                sOpcion = "04",
                parametros = new[]
                {
                    "Ana", "Torres", "1", "12345678", "F", "2",
                    "Lima", "999999999", DateTime.Today.AddYears(-17).ToString("yyyy-MM-dd"), "secreto8"
                }
            };

            ArgumentException error = await Assert.ThrowsAsync<ArgumentException>(() => negocio.LIS_UsuarioBusiness(usuario));
            Assert.Contains("mayor de edad", error.Message);
        }

        [Fact]
        public async Task DniConLetrasEsRechazado()
        {
            UsuarioBusiness negocio = new UsuarioBusiness(new UsuarioDataFalso());
            GeneralEntity usuario = new GeneralEntity
            {
                sOpcion = "04",
                parametros = new[]
                {
                    "Ana", "Torres", "1", "AB345678", "F", "2",
                    "Lima", "999999999", "2000-01-01", "secreto8"
                }
            };

            ArgumentException error = await Assert.ThrowsAsync<ArgumentException>(() => negocio.LIS_UsuarioBusiness(usuario));
            Assert.Contains("DNI", error.Message);
        }

        [Fact]
        public async Task CarnetAlfanumericoEsAceptado()
        {
            UsuarioDataFalso datos = new UsuarioDataFalso();
            UsuarioBusiness negocio = new UsuarioBusiness(datos);
            GeneralEntity usuario = new GeneralEntity
            {
                sOpcion = "04",
                parametros = new[]
                {
                    "Ana", "Torres", "2", "CE998877", "F", "2",
                    "Lima", "999999999", "2000-01-01", "secreto8"
                }
            };

            await negocio.LIS_UsuarioBusiness(usuario);

            Assert.Equal("CE998877", datos.UltimoParametro.Split('|')[3]);
        }

        private sealed class UsuarioDataFalso : IUsuarioData
        {
            public string UltimoParametro { get; private set; }

            public Task<object> LIS_UsuarioData(GeneralEntity erp)
            {
                UltimoParametro = erp.pParametro;
                return Task.FromResult<object>("OK");
            }
        }
    }
}
