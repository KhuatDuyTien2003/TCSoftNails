using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using NailsTcsoft3.Data;
using NailsTcsoft3.repository;
using OfficeOpenXml;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<ThuctapKtktcnNail2025Context>(opts =>
{
    opts.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

var secretKeyByte = Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:SecretKey"]);
builder.Services.AddIdentity<Account, IdentityRole>()
      .AddEntityFrameworkStores<ThuctapKtktcnNail2025Context>()
        .AddDefaultTokenProviders();
builder.Services.Configure<IdentityOptions>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 1;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
});

// Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// Cấu hình JWT Authentication
builder.Services.AddAuthentication(opts =>
{
    opts.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opts.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

    opts.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;

}).AddJwtBearer(opts =>
{
    opts.SaveToken = true;
    opts.RequireHttpsMetadata = false;
    opts.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateActor = false,
        ValidateAudience = false,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(secretKeyByte)
    };
});


// Cấu hình upload file tối đa 100MB
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 100_000_000;
});

builder.Services.AddTransient<IEmailService, EmailService>();




builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CUSTOMER:ADD", policy =>
        policy.RequireClaim("Action", "CUSTOMER:ADD"));
    options.AddPolicy("CUSTOMER:VIEW", policy =>
        policy.RequireClaim("Action", "CUSTOMER:VIEW"));
    options.AddPolicy("CUSTOMER:EDIT", policy =>
        policy.RequireClaim("Action", "CUSTOMER:EDIT"));

     options.AddPolicy("CUSTOMER:DELETE", policy =>
        policy.RequireClaim("Action", "CUSTOMER:DELETE"));

});
builder.Services.AddAuthorization();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ISaveImageRepo, SaveImageRepo>();
var app = builder.Build();
ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
app.Use(async (context, next) =>
{
    context.Response.Headers.Remove("Content-Security-Policy");
    await next();
});

app.UseStaticFiles();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseStaticFiles();

app.UseCors("AllowAll");

//app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
