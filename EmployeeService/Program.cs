using EmployeeService.Infrastructure.Data;
using System.Text.Json.Serialization;

namespace EmployeeService
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Logging.ClearProviders();
            builder.Logging.AddConsole();

            // Add services to the container(DI).
            builder.Services.ConfigureHttpJsonOptions(options => {
                options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter JWT Token like: your token"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
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

            builder.Services.AddScoped<IDbConnectionFactory, SqlConnectionFactory>();
            builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
            builder.Services.AddScoped<IRepository<Employee>, EmployeeRepository>();
            builder.Services.AddScoped<IRepository<Department>, DepartmentRepository>();
            builder.Services.AddScoped<IRepository<Position>, PositionRepository>();
            builder.Services.AddScoped<UserRepository>();
            builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
            builder.Services.AddScoped<IEmployeeBusinessRules, EmployeeBusinessRules>();
            builder.Services.AddScoped<IPositionBusinessRules, PositionBusinessRules>();
            builder.Services.AddScoped<IDepartmentBusinessRules, DepartmentBusinessRules>();

            // Use Authentication
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateIssuerSigningKey = true,
                        ValidateLifetime = true, 

                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidAudience = builder.Configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
                        ClockSkew = TimeSpan.Zero 
                    };
                });
            // Use Authorization
            builder.Services.AddAuthorization( builder =>
            {
                builder.AddPolicy("FullCRUD", context =>
                {
                    context.RequireRole(Roles.HR.ToString());
                });

                builder.AddPolicy("EmployeesReadOnly", context =>
                {
                    context.RequireRole(Roles.HR.ToString(), Roles.Manager.ToString());
                });
            });

            // Inject MediatR into DI Container
            builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

            var appName = builder.Configuration["ApplicationSettings:ApplicationName"];
            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

            // Cross-Origin Resource Sharing (CORS) for React integration
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("FrontendPolicy", policy =>
                {
                    policy.WithOrigins("http://localhost:8080")
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials();
                });
            });

            var app = builder.Build();
            app.Logger.LogInformation("Application started successfully (Information)");
            
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Best Order for Middleware: Exception Handling, Logging, Authentication, Authorization
            app.UseMiddleware<GlobalExceptionMiddleware>();
            app.UseMiddleware<RequestLoggingMiddleware>();
            app.UseCors("FrontendPolicy");
            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapGroup("/api/auth").MapAuthEndpoints();
            app.MapGroup("/api/employees").MapEmployeesEndpoints();
            app.MapGroup("/api/departments").MapDepartmentEndpoints().RequireAuthorization("FullCRUD");
            app.MapGroup("/api/positions").MapPositionEndpoints().RequireAuthorization("FullCRUD");

            //// Seed Database
            //await DatabaseSeeder.SeedAsync(app.Services);

            app.Run();

        }
    }
}
