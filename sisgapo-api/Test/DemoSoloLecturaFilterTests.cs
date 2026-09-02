using System.Collections.Generic;
using System.Threading.Tasks;
using Entity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using SISGAPO_API.Seguridad;
using Xunit;

namespace Test
{
    public class DemoSoloLecturaFilterTests
    {
        [Fact]
        public async Task EscrituraEsBloqueadaCuandoLaDemoEsSoloLectura()
        {
            DemoSoloLecturaFilter filtro = new DemoSoloLecturaFilter(fnConfiguracion(true));
            ActionExecutingContext contexto = fnContexto("Almacen", "CrudAlmacen", "05");
            bool bEjecutada = false;

            await filtro.OnActionExecutionAsync(contexto, () =>
            {
                bEjecutada = true;
                return Task.FromResult(fnContextoEjecutado(contexto));
            });

            ObjectResult resultado = Assert.IsType<ObjectResult>(contexto.Result);
            Assert.Equal(StatusCodes.Status403Forbidden, resultado.StatusCode);
            Assert.False(bEjecutada);
        }

        [Fact]
        public async Task LecturaContinuaDisponibleEnModoDemo()
        {
            DemoSoloLecturaFilter filtro = new DemoSoloLecturaFilter(fnConfiguracion(true));
            ActionExecutingContext contexto = fnContexto("Almacen", "CrudAlmacen", "01");
            bool bEjecutada = false;

            await filtro.OnActionExecutionAsync(contexto, () =>
            {
                bEjecutada = true;
                return Task.FromResult(fnContextoEjecutado(contexto));
            });

            Assert.True(bEjecutada);
            Assert.Null(contexto.Result);
        }

        [Fact]
        public async Task EscrituraContinuaDisponibleFueraDelModoDemo()
        {
            DemoSoloLecturaFilter filtro = new DemoSoloLecturaFilter(fnConfiguracion(false));
            ActionExecutingContext contexto = fnContexto("Almacen", "CrudAlmacen", "05");
            bool bEjecutada = false;

            await filtro.OnActionExecutionAsync(contexto, () =>
            {
                bEjecutada = true;
                return Task.FromResult(fnContextoEjecutado(contexto));
            });

            Assert.True(bEjecutada);
            Assert.Null(contexto.Result);
        }

        private static IConfiguration fnConfiguracion(bool bSoloLectura)
        {
            return new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string>
                {
                    ["Demo:SoloLectura"] = bSoloLectura.ToString()
                })
                .Build();
        }

        private static ActionExecutingContext fnContexto(
            string sControlador,
            string sAccion,
            string sOpcion)
        {
            ControllerActionDescriptor descriptor = new ControllerActionDescriptor
            {
                ControllerName = sControlador,
                ActionName = sAccion
            };
            ActionContext actionContext = new ActionContext(
                new DefaultHttpContext(),
                new RouteData(),
                descriptor,
                new ModelStateDictionary());

            return new ActionExecutingContext(
                actionContext,
                new List<IFilterMetadata>(),
                new Dictionary<string, object>
                {
                    ["genEnt"] = new GeneralEntity { sOpcion = sOpcion }
                },
                new object());
        }

        private static ActionExecutedContext fnContextoEjecutado(ActionContext context)
        {
            return new ActionExecutedContext(
                context,
                new List<IFilterMetadata>(),
                new object());
        }
    }
}
