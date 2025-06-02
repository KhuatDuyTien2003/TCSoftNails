using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using NailsTcsoft3.Data;
using NailsTcsoft3.Middleware;
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
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero,
        IssuerSigningKey = new SymmetricSecurityKey(secretKeyByte)
    };
});


// Cấu hình upload file tối đa 100MB
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 100_000_000;
});

builder.Services.AddTransient<IEmailService, EmailService>();
//builder.Services.AddAuthorization(options =>
//{
//    options.AddPolicy("CUSTOMER:ADD", policy =>
//        policy.RequireClaim("Action", "CUSTOMER:ADD"));
//    options.AddPolicy("CUSTOMER:VIEW", policy =>
//        policy.RequireClaim("Action", "CUSTOMER:VIEW"));
//    options.AddPolicy("CUSTOMER:EDIT", policy =>
//        policy.RequireClaim("Action", "CUSTOMER:EDIT"));
//    options.AddPolicy("CUSTOMER:DELETE", policy =>
//       policy.RequireClaim("Action", "CUSTOMER:DELETE"));
//    options.AddPolicy("STAFF:ADD", policy =>
//        policy.RequireClaim("Action", "STAFF:ADD"));
//    options.AddPolicy("STAFF:VIEW", policy =>
//        policy.RequireClaim("Action", "STAFF:VIEW"));
//    options.AddPolicy("STAFF:EDIT", policy =>
//        policy.RequireClaim("Action", "STAFF:EDIT"));
//    options.AddPolicy("STAFF:DELETE", policy =>
//       policy.RequireClaim("Action", "STAFF:DELETE"));
//    options.AddPolicy("WORKDATE:ADD", policy =>
//    policy.RequireClaim("Action", "WORKDATE:ADD"));
//    options.AddPolicy("WORKDATE:VIEW", policy =>
//        policy.RequireClaim("Action", "WORKDATE:VIEW"));
//    options.AddPolicy("WORKDATE:EDIT", policy =>
//        policy.RequireClaim("Action", "WORKDATE:EDIT"));
//    options.AddPolicy("WORKDATE:DELETE", policy =>
//       policy.RequireClaim("Action", "WORKDATE:DELETE"));
//    options.AddPolicy("APPOINTMENT:ADD", policy =>
//    policy.RequireClaim("Action", "APPOINTMENT:ADD"));
//    options.AddPolicy("APPOINTMENT:VIEW", policy =>
//        policy.RequireClaim("Action", "APPOINTMENT:VIEW"));
//    options.AddPolicy("APPOINTMENT:EDIT", policy =>
//        policy.RequireClaim("Action", "APPOINTMENT:EDIT"));
//    options.AddPolicy("APPOINTMENT:DELETE", policy =>
//       policy.RequireClaim("Action", "APPOINTMENT:DELETE"));
//    options.AddPolicy("ROLE:ADD", policy =>
//policy.RequireClaim("Action", "ROLE:ADD"));
//    options.AddPolicy("ROLE:VIEW", policy =>
//        policy.RequireClaim("Action", "ROLE:VIEW"));
//    options.AddPolicy("ROLE:EDIT", policy =>
//        policy.RequireClaim("Action", "ROLE:EDIT"));
//    options.AddPolicy("ROLE:UPDATEFORUSER", policy =>
//        policy.RequireClaim("Action", "ROLE:UPDATEFORUSER"));
//    options.AddPolicy("ROLE:DELETE", policy =>
//       policy.RequireClaim("Action", "ROLE:DELETE"));
//    options.AddPolicy("GOODSRECEIPT:ADD", policy =>
//policy.RequireClaim("Action", "GOODSRECEIPT:ADD"));
//    options.AddPolicy("GOODSRECEIPT:VIEW", policy =>
//        policy.RequireClaim("Action", "GOODSRECEIPT:VIEW"));
//    options.AddPolicy("GOODSRECEIPT:EDIT", policy =>
//        policy.RequireClaim("Action", "GOODSRECEIPT:EDIT"));
//    options.AddPolicy("GOODSRECEIPT:SEARCH", policy =>
//        policy.RequireClaim("Action", "GOODSRECEIPT:SEARCH"));
//    options.AddPolicy("GOODSRECEIPT:DELETE", policy =>
//       policy.RequireClaim("Action", "GOODSRECEIPT:DELETE"));
//    options.AddPolicy("PRODUCT:ADD", policy =>
//policy.RequireClaim("Action", "PRODUCT:ADD"));
//    options.AddPolicy("PRODUCT:VIEW", policy =>
//        policy.RequireClaim("Action", "PRODUCT:VIEW"));
//    options.AddPolicy("PRODUCT:EDIT", policy =>
//        policy.RequireClaim("Action", "PRODUCT:EDIT"));
//    options.AddPolicy("PRODUCT:SEARCH", policy =>
//        policy.RequireClaim("Action", "PRODUCT:SEARCH"));
//    options.AddPolicy("PRODUCT:DELETE", policy =>
//       policy.RequireClaim("Action", "PRODUCT:DELETE"));
//    options.AddPolicy("BILL:ADD", policy =>
//policy.RequireClaim("Action", "BILL:ADD"));
//    options.AddPolicy("BILL:VIEW", policy =>
//        policy.RequireClaim("Action", "BILL:VIEW"));
//    options.AddPolicy("BILL:EDIT", policy =>
//        policy.RequireClaim("Action", "BILL:EDIT"));
//    options.AddPolicy("BILL:SEARCH", policy =>
//        policy.RequireClaim("Action", "BILL:SEARCH"));
//    options.AddPolicy("BILL:DELETE", policy =>
//       policy.RequireClaim("Action", "BILL:DELETE"));


//});
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

//app.UseMiddleware<PermissionMiddleware>();
app.UseAuthorization();
app.MapControllers();

app.Run();

