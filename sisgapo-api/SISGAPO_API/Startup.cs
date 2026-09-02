using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NLog;
using SISGAPO_API.Seguridad;
using System;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Threading.RateLimiting;

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

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                    .AddJwtBearer(opciones =>
                    {
                        opciones.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidateIssuer = true,
                            ValidateAudience = true,
                            ValidateLifetime = true,
                            ValidateIssuerSigningKey = true,
                            ValidIssuer = ConfiguracionJwt.sEmisor,
                            ValidAudience = ConfiguracionJwt.sAudiencia,
                            IssuerSigningKey = new SymmetricSecurityKey(
                                Encoding.UTF8.GetBytes(ConfiguracionJwt.sClave)),
                            ClockSkew = TimeSpan.Zero
                        };
                    });

            services.AddAuthorization();

            services.AddRateLimiter(opciones =>
            {
                opciones.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
                opciones.AddPolicy("Login", contexto =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        contexto.Connection.RemoteIpAddress?.ToString() ?? "desconocida",
                        _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 5,
                            Window = TimeSpan.FromMinutes(1),
                            QueueLimit = 0,
                            AutoReplenishment = true
                        }));
                opciones.OnRejected = async (contexto, cancellationToken) =>
                {
                    contexto.HttpContext.Response.ContentType = "application/json";
                    await contexto.HttpContext.Response.WriteAsync(
                        JsonSerializer.Serialize(new
                        {
                            cod = "0",
                            mensaje = "Demasiados intentos. Vuelve a intentarlo en un minuto."
                        }),
                        cancellationToken);
                };
            });

            services.AddControllers(opciones =>
            {
                opciones.Filters.Add<DemoSoloLecturaFilter>();
            });
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "SISGAPO_API", Version = "v1" });

                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Pega aquí el token que devuelve /LoginService."
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseExceptionHandler(manejador =>
            {
                manejador.Run(async contexto =>
                {
                    IExceptionHandlerFeature oFeature = contexto.Features.Get<IExceptionHandlerFeature>();

                    bool bSolicitudInvalida = oFeature?.Error is ArgumentException;

                    if (oFeature != null && !bSolicitudInvalida)
                    {
                        logger.Error(oFeature.Error, "Error no controlado en {0}", contexto.Request.Path);
                    }

                    contexto.Response.StatusCode = bSolicitudInvalida
                        ? StatusCodes.Status400BadRequest
                        : StatusCodes.Status500InternalServerError;
                    contexto.Response.ContentType = "application/json";

                    await contexto.Response.WriteAsync(JsonSerializer.Serialize(new
                    {
                        cod = "0",
                        mensaje = bSolicitudInvalida
                            ? oFeature.Error.Message
                            : env.IsDevelopment() && oFeature != null
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
                app.UseHttpsRedirection();
            }

            app.UseRouting();

            app.UseCors(sPoliticaCors);
            app.UseRateLimiter();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
