using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailsTcsoft3.Data;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CustomerRanksController : ControllerBase
    {

        private readonly ThuctapKtktcnNail2025Context _context;
        private readonly IConfiguration _configuration;

        public CustomerRanksController(ThuctapKtktcnNail2025Context context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: /CustomerRanks
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // Lấy tất cả các CustomerRank chưa bị xóa
            var customerRanks = await _context.CustomerRanks
                .Where(cr => !cr.IsDeleted)
                .ToListAsync();

            return Ok(new
            {
                success = true,
                message = "Lấy danh sách customer rank thành công",
                data = customerRanks
            });
        }

        // GET: /CustomerRanks/GetById/{id}
        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var customerRank = await _context.CustomerRanks.FindAsync(id);

            if (customerRank == null || customerRank.IsDeleted)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy customer rank"
                });
            }

            return Ok(new
            {
                success = true,
                message = "Lấy customer rank thành công",
                data = customerRank
            });
        }

        // POST: /CustomerRanks/PostCustomerRank
        [HttpPost("PostCustomerRank")]
        public async Task<IActionResult> PostCustomerRank([FromBody] CustomerRank customerRank)
        {
            if (customerRank == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Dữ liệu không hợp lệ"
                });
            }

            CustomerRank customerrank = new CustomerRank
            {
                RankName = customerRank.RankName,
                DiscountRate = customerRank.DiscountRate,
                TotalMoney = customerRank.TotalMoney,
                Status = customerRank.Status
            };
            await _context.CustomerRanks.AddAsync(customerrank);
            var result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                return Ok(new
                {
                    success = true,
                    message = "Thêm hạng thành viên thành công"
                });
            }

            return BadRequest(new
            {
                success = false,
                message = "Thêm hạng thành viên thất bại"
            });
        }

        // PUT: /CustomerRanks/UpdateCustomerRank/{id}
        [HttpPut("PutCustomerRank/{id}")]
        public async Task<IActionResult> PutCustomerRank(int id, [FromBody] CustomerRank customerRank)
        {
            var existingCustomerRank = await _context.CustomerRanks.FindAsync(id);
            if (existingCustomerRank == null || existingCustomerRank.IsDeleted)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy customer rank"
                });
            }

            // Cập nhật các trường (bạn có thể điều chỉnh theo yêu cầu)
            existingCustomerRank.RankName = customerRank.RankName;
            existingCustomerRank.DiscountRate = customerRank.DiscountRate;
            existingCustomerRank.TotalMoney = customerRank.TotalMoney;
            existingCustomerRank.Status = customerRank.Status;
            // Nếu cần cập nhật thêm các trường khác thì thực hiện ở đây

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Cập nhật customer rank thành công",
                data = existingCustomerRank
            });
        }

        // DELETE: /CustomerRanks/DeleteCustomerRank/{id}
        [HttpDelete("DeleteCustomerRank/{id}")]
        public async Task<IActionResult> DeleteCustomerRank(int id)
        {
            var customerRank = await _context.CustomerRanks.FindAsync(id);
            if (customerRank == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy customer rank"
                });
            }

            // Thực hiện soft-delete: cập nhật IsDeleted thành true
            customerRank.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Xóa customer rank thành công"
            });
        }

    }
}
