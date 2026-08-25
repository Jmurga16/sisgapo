using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using NLog;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace SISGAPO_API
{
    public class Startup
    {
        private const string sPoliticaCors = "PoliticaSISGAPO";

        private static readonly Logger logger = LogManager.GetCurrentClassLogger();

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            //Los orígenes permitidos vienen de configuración (appsettings / variables de
            //entorno), no escritos en el código. Antes el origen de producción estaba
            //cableado y ni siquiera coincidía con el dominio donde se desplegaba el front.
            string[] arOrigenes = Configuration.GetSection("Cors:OrigenesPermitidos").Get<string[]>()
                                  ?? new[] { "http://localhost:4200" };

            services.AddCors(options =>
            {
                options.AddPolicy(sPoliticaCors, builder =>
                {
                    builder.WithOrigins(arOrigenes)
                           .AllowAnyMethod()
                           .AllowAnyHeader();
                });
            });

            services.AddControllers();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "SISGAPO_API", Version = "v1" });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            //Manejo de excepciones: registra el detalle del lado del servidor y devuelve
            //un cuerpo consistente. Antes la excepción subía intacta y el cliente recibía
            //un 500 vacío, sin rastro en ningún log.
            app.UseExceptionHandler(manejador =>
            {
                manejador.Run(async contexto =>
                {
                    IExceptionHandlerFeature oFeature = contexto.Features.Get<IExceptionHandlerFeature>();

                    if (oFeature != null)
                    {
                        logger.Error(oFeature.Error, "Error no controlado en {0}", contexto.Request.Path);
                    }

                    contexto.Response.StatusCode = StatusCodes.Status500InternalServerError;
                    contexto.Response.ContentType = "application/json";

                    await contexto.Response.WriteAsync(JsonSerializer.Serialize(new
                    {
                        cod = "0",
                        mensaje = env.IsDevelopment() && oFeature != null
                            ? oFeature.Error.Message
                            : "Ocurrió un error al procesar la solicitud."
                    }));
                });
            });

            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "SISGAPO_API v1"));
            }
            else
            {
                //En desarrollo la redirección a HTTPS devuelve un 307 al preflight de CORS
                //y rompe las llamadas del frontend. Ver 06-hallazgos.md §S-08.
                app.UseHttpsRedirection();
            }

            app.UseRouting();

            app.UseCors(sPoliticaCors);

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
