using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NailsTcsoft3.Data;
using NailsTcsoft3.Models;
using NailsTcsoft3.repository;
using Newtonsoft.Json.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ThuctapKtktcnNail2025Context _context;
        private readonly IConfiguration _configuration;
        private readonly UserManager<Account> _userManager;
        private readonly SignInManager<Account> _signInManager;
        private readonly IEmailService _emailService;
        public AccountController(ThuctapKtktcnNail2025Context context, IConfiguration configuration, UserManager<Account> userManager, SignInManager<Account> signInManager, IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _userManager = userManager;
            _signInManager = signInManager;
            _emailService = emailService;
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
            var user = await _userManager.FindByEmailAsync(account.Email);
            if (user != null)
            {
                return Ok(new
                {
                    success = false,
                    message = "Tài khoản này đã tồn tại"
                });
            }
            else
            {
                var newUser = new Account { StaffId = account.StaffId, UserName = account.UserName, Email = account.Email };
                var result = await _userManager.CreateAsync(newUser, account.Password);
                if (result.Succeeded)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Tạo tài khoản thành công"
                    });
                }
            }

            return BadRequest();
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

            var user = await _signInManager.PasswordSignInAsync(username, password, false, false);
            if (user.Succeeded)
            {
                return Ok(new
                {
                    success = true,
                    message = "Đăng nhập thành công",
                    data = GeneToken(username, password)
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
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest model) {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if(user == null)
            {
                return BadRequest("Email không tồn tại");
            }
            else
            {
                var tokenForgot = await _userManager.GeneratePasswordResetTokenAsync(user);
                var resetLink = $"{_configuration["ClientUrl"]}Reset-Password?token={Uri.EscapeDataString(tokenForgot)}&email={Uri.EscapeDataString(user.Email)}";
                await _emailService.SendEmailAsync(user.Email, "Reset Password", $"Click vào link để đặt lại mật khẩu: {resetLink}");
                return Ok(new
                {
                    success = true,
                    message = "Truy cập email để đặt lại mật khẩu"
                });
            }
         

        }

        [HttpPost("ResetPassword")]

        public async Task<IActionResult> ResetPassword([FromBody] Dictionary<string, string> data)
        {
            // Kiểm tra đầu vào
            if (!data.ContainsKey("Email") || !data.ContainsKey("Password") || !data.ContainsKey("token"))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Thiếu thông tin bắt buộc (Email, Password, token)"
                });
            }

            var email = data["Email"].ToLower();
            var password = data["Password"];
            var token = data["token"];
 



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

        private async Task<string> GeneToken(string Username, string Password)
        {
            var jwtHandle = new JwtSecurityTokenHandler();

            // Tìm tài khoản theo UserName
            var account = await _userManager.FindByNameAsync(Username);
            if (account == null)
            {
                throw new Exception("Tài khoản không tồn tại.");
            }

            // Kiểm tra mật khẩu
            var isPasswordValid = await _userManager.CheckPasswordAsync(account, Password);
            if (!isPasswordValid)
            {
                throw new Exception("Mật khẩu không chính xác.");
            }

            // Lấy secret key từ appsettings.json
            var secretKey = _configuration["AppSettings:SecretKey"];
            if (string.IsNullOrEmpty(secretKey))
            {
                throw new Exception("SecretKey không được cấu hình.");
            }

            var secretKeyByte = Encoding.UTF8.GetBytes(secretKey);

            // Tạo token
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
            new Claim("StaffId", account.StaffId.ToString()),
            new Claim("IdToken", Guid.NewGuid().ToString()),
        }),
                Expires = DateTime.UtcNow.AddMinutes(30),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(secretKeyByte), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = jwtHandle.CreateToken(tokenDescriptor);
            return jwtHandle.WriteToken(token);
        }

    }
}
