using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailsTcsoft3.Data;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class PromotionDetailController : ControllerBase
    {
        private readonly ThuctapKtktcnNail2025Context _context;

        public PromotionDetailController(ThuctapKtktcnNail2025Context context)
        {
            _context = context;
        }
        [HttpGet("GetAllPromotionDetail")]
        public async Task<IActionResult> GetAll()
        {
            var listPromotionDetail = await _context.PromotionDetails.ToListAsync();
            if (!listPromotionDetail.Any())
            {
                return BadRequest();
            }
            else
            {
                return Ok(new
                {
                    success = true,
                    data = listPromotionDetail
                });
            }
        }
        [HttpGet("GetPromotionDetailById")]
        public async Task<IActionResult> GetPromotionDetailById(int id)
        {
            var listPromotionDetail = await _context.PromotionDetails.FirstOrDefaultAsync(a => a.Id == id);
            if (listPromotionDetail == null)
            {
                return BadRequest();
            }
            else
            {
                return Ok(new
                {
                    success = true,
                    data = listPromotionDetail
                });
            }
        }

        [HttpPost("CreatePromotionDetail")]
        public async Task<IActionResult> CreatePromotionDetail(PromotionDetail promotionDetail)
        {
            var NewPromotionDetail = new PromotionDetail
            {
               PromotionId = promotionDetail.PromotionId,
               PromotionCode = promotionDetail.PromotionCode,
               IsUsed = promotionDetail.IsUsed,
               UsedDate = promotionDetail.UsedDate,
               CustomerId = promotionDetail.CustomerId,
               IsDeleted = promotionDetail.IsDeleted,
               Status = promotionDetail.Status
            };
            _context.PromotionDetails.AddAsync(NewPromotionDetail);
            var result = await _context.SaveChangesAsync();

            if (result == null)
            {
                return BadRequest("them chi tiet khuyen mai that bai !!");
            }
            return Ok(new
            {
                success = true,
                message = "Them khuyen mai thanh cong !",
                data = NewPromotionDetail
            });

        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePromotionDetail(int id, PromotionDetail promotionDetail)
        {
            var existingPromotionDetail = await _context.PromotionDetails.FindAsync(id);
            if (existingPromotionDetail == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy khuyến mãi!" });
            }
            existingPromotionDetail.Id = promotionDetail.Id;
            existingPromotionDetail.PromotionId = promotionDetail.PromotionId;
            existingPromotionDetail.PromotionCode = promotionDetail.PromotionCode;
            existingPromotionDetail.IsUsed = promotionDetail.IsUsed;
            existingPromotionDetail.IsDeleted = promotionDetail.IsDeleted;
            existingPromotionDetail.UsedDate = promotionDetail.UsedDate;
            existingPromotionDetail.CustomerId = promotionDetail.CustomerId;
            existingPromotionDetail.IsDeleted = promotionDetail.IsDeleted;
            existingPromotionDetail.Status = promotionDetail.Status;
            _context.PromotionDetails.Update(existingPromotionDetail);
            await _context.SaveChangesAsync();
            return Ok(new
            {
                success = true,
                message = "Cập nhật khuyến mãi thành công!",
                data = existingPromotionDetail
            });
        }
        [HttpDelete("DeletePromotionDetail/{id}")]
        public async Task<IActionResult> DeletePromotionDetail(int id)
        {
            var promotionDetail = await _context.PromotionDetails.FindAsync(id);
            if (promotionDetail == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy khuyến mãi để xóa!" });
            }

            _context.PromotionDetails.Remove(promotionDetail);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Xóa khuyến mãi thành công!" });
        }
    }
}
