using System.Text;
using HireFlowPro.Api.Middleware;
using HireFlowPro.Core.Interfaces;
using HireFlowPro.Infrastructure.Data;
using HireFlowPro.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ── CORS ─────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000",
                "https://hireflowpro.onrender.com")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ── JWT Authentication ───────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"] ?? "HireFlowPro-Dev-Secret-Key-2024-Min-32-Chars!!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "HireFlowPro";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "HireFlowPro";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.FromMinutes(1)
    };
});

builder.Services.AddAuthorization();

// ── Database ─────────────────────────────────────────────────────────────────
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (!string.IsNullOrWhiteSpace(databaseUrl))
{
    // Parse Render.com / Heroku style DATABASE_URL (postgres://user:pass@host:port/db)
    var uri = new Uri(databaseUrl);
    var userInfo = uri.UserInfo.Split(':');
    var npgsqlConn = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";

    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(npgsqlConn));
}
else if (!string.IsNullOrWhiteSpace(connectionString))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(connectionString));
}
else
{
    // Fallback to SQLite for local development without PostgreSQL
    var sqlitePath = Path.Combine(builder.Environment.ContentRootPath, "hireflowpro.db");
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlite($"Data Source={sqlitePath}"));
}

// ── Application Services ─────────────────────────────────────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IApplicationService, ApplicationService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IAIService, AIService>();
builder.Services.AddScoped<IAIQuotaService, AIQuotaService>();
builder.Services.AddScoped<IResumeProfileService, ResumeProfileService>();

// ── HttpClient for AIService ─────────────────────────────────────────────────
builder.Services.AddHttpClient<IAIService, AIService>();

// ── Controllers + Swagger ────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// ── Kestrel: listen on PORT env var (Render.com) — dev uses launchSettings ───
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

var app = builder.Build();

// ── Auto-run EF migrations on startup ────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "Migration failed, ensuring database is created instead.");
        db.Database.EnsureCreated();
    }

    await DbSeeder.SeedAsync(db);
}

// ── Middleware pipeline ──────────────────────────────────────────────────────

// Global exception handler (must be first)
app.UseMiddleware<ExceptionMiddleware>();

// Security headers
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    await next();
});

// Serve React static files from wwwroot in production
if (!app.Environment.IsDevelopment())
{
    app.UseDefaultFiles();
    app.UseStaticFiles();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// SPA fallback: serve index.html for non-API routes in production
if (!app.Environment.IsDevelopment())
{
    app.MapFallbackToFile("index.html");
}

app.Run();
