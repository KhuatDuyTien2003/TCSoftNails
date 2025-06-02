using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NailsTcsoft3.Data;
using NailsTcsoft3.Models;
using NailsTcsoft3.repository;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Web;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ThuctapKtktcnNail2025Context _context;
        private readonly IConfiguration _configuration;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<Account> _userManager;
        private readonly SignInManager<Account> _signInManager;

        private readonly IEmailService _emailService;
        public AccountController(ThuctapKtktcnNail2025Context context, IConfiguration configuration, UserManager<Account> userManager, SignInManager<Account> signInManager, IEmailService emailService, RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _configuration = configuration;
            _userManager = userManager;
            _signInManager = signInManager;
            _emailService = emailService;
            _roleManager = roleManager;
        }
        [HttpGet]
        public async Task<IActionResult> getAll()
        {
            var userList = await _userManager.Users.ToListAsync();
            return Ok(new
            {
                success = true,
                message = "Lấy tk thành công",
                data = userList
            });
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register(AccountModel account)
        {
            var userByEmail = await _userManager.FindByEmailAsync(account.Email);
            if (userByEmail != null)
            {
                return Ok(new
                {
                    success = false,
                    message = "Email đã được sử dụng!"
                });
            }
            var userByUsername = await _userManager.FindByNameAsync(account.UserName);
            if (userByUsername != null)
            {
                return Ok(new
                {
                    success = false,
                    message = "Tên đăng nhập đã tồn tại!"
                });

            }
            var newUser = new Account
            {
                StaffId = account.StaffId,
                UserName = account.UserName,
                Email = account.Email
            };

            var result = await _userManager.CreateAsync(newUser, account.Password);
            if (result.Succeeded)
            {

                return Ok(new
                {
                    success = true,

                    message = "Tạo tài khoản thành công!"

                });
            }


            return BadRequest(new
            {
                success = false,
                message = "Đăng ký thất bại, vui lòng thử lại!"
            });
        }
    

    [HttpPost("Login")]
    public async Task<IActionResult> Login([FromBody] Dictionary<string, string> data)
    {
        if (!data.ContainsKey("Username") || !data.ContainsKey("Password"))
        {
            return BadRequest(new
            {
                success = false,
                message = "Thiếu Username hoặc Password"
            });
        }

        string username = data["Username"];
        string password = data["Password"];
        var account = await _userManager.FindByNameAsync(username);

        var user = await _signInManager.PasswordSignInAsync(username, password, false, false);
        if (user.Succeeded)
        {
            return Ok(new
            {
                success = true,
                message = "Đăng nhập thành công",
                data = new { token = await GeneToken(username), staffId = account.StaffId, refreshToken = await GenerateRefreshtoken(account.StaffId) }
            });
        }
        return Ok(new
        {
            success = false,
            message = "Sai tên tài khoản hoặc mật khẩu"
        });
    }


        public class ForgotPasswordRequest
        {
            public string Email { get; set; }
        }
        [HttpPost("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return Ok(new
                {
                    success = false,
                    message = "Email này không tồn tại",
                
                });
            }
            else
            {
                var tokenForgot = await _userManager.GeneratePasswordResetTokenAsync(user);
               
                var resetLink = $"{_configuration["ClientUrl"]}Reset-Password?token={WebUtility.UrlEncode(tokenForgot)}&email={Uri.EscapeDataString(user.Email)}";
                await _emailService.SendEmailAsync(user.Email, "Reset Password", $"Click vào link để đặt lại mật khẩu: {resetLink}");
                return Ok(new
                {
                    success = true,
                    message = "Truy cập email để đặt lại mật khẩu",
                    token = tokenForgot

                });
            }
        }

        public class RePassModel
        {
            public string Email { get; set; }
            public string Password { get; set; }
            public string Token { get; set; }
        }

        public class modelPassword
        {
            public string Email { get; set; }
            public string Token { get; set; }
            public string Password { get; set; }

        }

        [HttpPost("ResetPassword")]


        public async Task<IActionResult> ResetPassword([FromBody] modelPassword data)
        {
            // Kiểm tra đầu vào
            if (data.Token == "" || data.Email =="")
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Thiếu thông tin bắt buộc (Email, Password, Token)"
                });
            }

            var email = data.Email.ToLower();
            var password = data.Password;
            var token = data.Token;

            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                return BadRequest(new { success = false, message = "Email không tồn tại" });
            }
            var result = await _userManager.ResetPasswordAsync(user, token, password);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    success = false,
                    errors = result.Errors.Select(e => e.Description)
                });
            }

            return Ok(new
            {
                success = true,
                message = "Đổi mật khẩu thành công"
            });
        }

        private async Task<string> GeneToken(string username)
        {
            var jwtHandler = new JwtSecurityTokenHandler();

            var account = await _userManager.FindByNameAsync(username);
            if (account == null)
                throw new Exception("Tài khoản không tồn tại.");

            var secretKey = _configuration["AppSettings:SecretKey"];
            if (string.IsNullOrEmpty(secretKey))
                throw new Exception("SecretKey chưa được cấu hình.");

            var keyBytes = Encoding.UTF8.GetBytes(secretKey);

            var claims = new List<Claim>
    {
        new Claim("StaffId", account.StaffId.ToString()),
        new Claim("IdToken", Guid.NewGuid().ToString()),
        new Claim(ClaimTypes.Name, account.UserName)
    };

            var roles = await _userManager.GetRolesAsync(account);

            // Dùng HashSet để tránh quyền bị trùng lặp
            var actionClaimsSet = new HashSet<string>();

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));

                var fullRole = await _roleManager.FindByNameAsync(role);
                if (fullRole != null)
                {
                    var functions = await _context.Permissions
                        .Where(p => p.RoleId == fullRole.Id)
                        .Select(p => p.FunctionId)
                        .Distinct()
                        .ToListAsync();

                    foreach (var functionId in functions)
                    {
                        claims.Add(new Claim("FunctionId", functionId));

                        var actions = await _context.Permissions
                            .Where(p => p.FunctionId == functionId && p.RoleId == fullRole.Id)
                            .Select(p => p.ActionId)
                            .Distinct()
                            .ToListAsync();

                        foreach (var actionId in actions)
                        {
                            // Tạo string permission như "FUNCTION_ACTION"
                            actionClaimsSet.Add($"{functionId}_{actionId}");
                        }
                    }
                }
            }

            // Thêm claim "Action" duy nhất, giá trị là JSON array các quyền
            var actionClaimsJson = JsonConvert.SerializeObject(actionClaimsSet.ToList());
            claims.Add(new Claim("Action", actionClaimsJson));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddSeconds(10),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = jwtHandler.CreateToken(tokenDescriptor);
            return jwtHandler.WriteToken(token);
        }

        public class Refreshtokenrequest
        {

            public string refreshtoken { get; set; }
            public int idStaff { get; set; }
        }


        private async Task<string> GenerateRefreshtoken(int staffId)
        {
            var newToken = Guid.NewGuid().ToString();
            var refreshToken = new RefreshToken
            {
                Token = newToken,
                Expiration = DateTime.UtcNow.AddDays(7),
                idStaff = staffId.ToString()
            };

            await _context.RefreshTokens.AddAsync(refreshToken);
            await _context.SaveChangesAsync();

            return newToken;
        }

        private async Task<bool> ValidateRefreshToken(int staffId, string refreshToken)
        {
            return await _context.RefreshTokens.AnyAsync(rt =>
                rt.idStaff == staffId.ToString() &&
                rt.Token == refreshToken &&
                rt.Expiration > DateTime.UtcNow);
        }

        public class Token
        {
            public string accessToken { get; set; }
            public string refreshToken { get; set; }
            public int staffId { get; set; }
        }

        [HttpPost("RefreshToken")]
        public async Task<IActionResult> RefreshToken([FromBody] Refreshtokenrequest request)
        {
            var isValid =await ValidateRefreshToken(request.idStaff, request.refreshtoken);
            if (!isValid)
            {
                return Unauthorized(new { message = "Refresh token không hợp lệ hoặc đã hết hạn" });
            }

      
            var account = await _userManager.Users.FirstOrDefaultAsync(u => u.StaffId == request.idStaff);
            if (account == null)
            {
                return NotFound(new { message = "Tài khoản không tồn tại" });
            }

            
            var accessToken = await GeneToken(account.UserName);

      
            var newRefreshToken = await GenerateRefreshtoken(request.idStaff);

            return Ok(new ResponseModel<Token>
            {
                success = true,
                message = "Refresh token thành công",
                data = new Token
                {
                    accessToken = accessToken,
                    refreshToken = !string.IsNullOrEmpty(newRefreshToken) ? newRefreshToken : "",

            staffId = account.StaffId
                }
               
            });

        }

    }

}

