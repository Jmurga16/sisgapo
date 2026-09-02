using Entity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SISGAPO_API.Seguridad
{
    public class DemoSoloLecturaFilter : IAsyncActionFilter
    {
        private readonly bool bSoloLectura;

        public DemoSoloLecturaFilter(IConfiguration configuration)
        {
            bSoloLectura = configuration.GetValue<bool>("Demo:SoloLectura");
        }

        public async Task OnActionExecutionAsync(
            ActionExecutingContext context,
            ActionExecutionDelegate next)
        {
            if (!bSoloLectura || !fnEsEscritura(context))
            {
                await next();
                return;
            }

            context.Result = new ObjectResult(new
            {
                cod = "0",
                mensaje = "La demo pública es de solo lectura."
            })
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
        }

        private static bool fnEsEscritura(ActionExecutingContext context)
        {
            ControllerActionDescriptor descriptor = context.ActionDescriptor as ControllerActionDescriptor;

            if (descriptor == null)
            {
                return false;
            }

            string sControlador = descriptor.ControllerName;
            string sAccion = descriptor.ActionName;
            string sOpcion = context.ActionArguments.Values
                .OfType<GeneralEntity>()
                .Select(entidad => entidad.sOpcion)
                .Concat(context.ActionArguments.Values
                    .OfType<UsuarioEntity>()
                    .Select(entidad => entidad.sOpcion))
                .FirstOrDefault();

            if (sControlador == "Zona")
            {
                return !HttpMethods.IsGet(context.HttpContext.Request.Method);
            }

            if (sControlador == "Usuario")
            {
                return sOpcion == "04" || sOpcion == "05" || sOpcion == "06";
            }

            if (sControlador == "Almacen")
            {
                return sOpcion == "05" || sOpcion == "06" || sOpcion == "07";
            }

            if (sControlador == "Inventario" && sAccion == "CrudCategoria")
            {
                return sOpcion == "03" || sOpcion == "04" || sOpcion == "05";
            }

            if (sControlador == "Inventario" && sAccion == "CrudProductos")
            {
                return sOpcion == "06" || sOpcion == "07" || sOpcion == "08";
            }

            return false;
        }
    }
}
