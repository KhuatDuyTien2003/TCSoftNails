using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailsTcsoft3.Data;
using NailsTcsoft3.Models;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class StaffController : ControllerBase
    {
        private readonly ThuctapKtktcnNail2025Context _context;
        private readonly IConfiguration _configuration;

        public StaffController(ThuctapKtktcnNail2025Context context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;

        }

        [HttpPost("CreateStaff")]
        public async Task<IActionResult> CreateStaff(StaffModel staff)
        {
            var NewStaff = new Staff
            {
                StaffName = staff.StaffName,
                Email = staff.Email,
                Birthday = staff.Birthday,
                Gender = staff.Gender,
                JoinDate = DateTime.UtcNow,
                IsDeleted = false,
                NumberPhone = staff.NumberPhone,
                Status = true,
                UrlAvatar = staff.UrlAvatar,
                TotalStar = null
            };

            _context.Staff.AddAsync(NewStaff);
            var result = await _context.SaveChangesAsync();
            var staff2 = await _context.Staff.FirstOrDefaultAsync(s => s.StaffName == NewStaff.StaffName && s.Birthday == NewStaff.Birthday && s.JoinDate == NewStaff.JoinDate && s.NumberPhone == NewStaff.NumberPhone);
            if (result > 0 && staff2 != null)
            {
                return Ok(new
                {
                    success = true,
                    message = "Thêm nhân viên thành công",
                    data = new { StaffId = staff2.StaffId, Email = staff.Email },
                });
            }
            return BadRequest("Thêm nhân viên thất bại!");

        }
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            var listStaff = await _context.Staff.ToListAsync();
            if (!listStaff.Any())
            {
                return BadRequest();
            }
            else
            {
                return Ok(new
                {
                    success = true,
                    message = "Lấy dữ liệu thành công",
                    data = listStaff
                }

                    );
            }
        }
    }
}
