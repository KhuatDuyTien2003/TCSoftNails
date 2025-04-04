using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailsTcsoft3.Data;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [EnableCors("AllowAll")]
    public class PromotionController : ControllerBase
    {
        private readonly ThuctapKtktcnNail2025Context _context;

        public PromotionController(ThuctapKtktcnNail2025Context context)
        {
            _context = context;
        }
        [HttpGet("GetAllPromotion")]
        public async Task<IActionResult> GetAll()
        {
            var listPromotion = await _context.Promotions.Where(e => e.IsDeleted == false).ToListAsync();
            if (!listPromotion.Any())
            {
                return BadRequest();
            }
            else
            {
                return Ok(new
                {
                    success = true,
                    data = listPromotion
                });
            }
        }
        [HttpGet("GetPromotionById")]
        public async Task<IActionResult> GetPromotionById(int id)
        {
            var listPromotion = await _context.Promotions.FirstOrDefaultAsync(a => a.PromotionId == id);
            if (listPromotion == null)
            {
                return BadRequest();
            }
            else
            {
                return Ok(new
                {
                    success = true,
                    data = listPromotion
                });
            }
        }

        [HttpPost("CreatePromotion")]
        public async Task<IActionResult> CreatePromotion(Promotion promotion)
        {
            var NewPromotion = new Promotion
            {
                PromotionName = promotion.PromotionName,
                PromotionType = promotion.PromotionType,
                StartDate = promotion.StartDate,
                EndDate = promotion.EndDate,
                Quantity = promotion.Quantity,
                ProductTypeId = promotion.ProductTypeId,
                IsPoints = promotion.IsPoints,
                Condition = promotion.Condition,
                RankId = promotion.RankId,
                UrlImage = promotion.UrlImage,
                IsDeleted = promotion.IsDeleted,
                Status = promotion.Status,
                Value_data = promotion.Value_data
            };
            _context.Promotions.AddAsync(NewPromotion);
            var result = await _context.SaveChangesAsync();

            if (result == null)
            {
                return BadRequest("them khuyen mai that bai !!");
            }
            return Ok(new
            {
                success = true,
                message = "Them khuyen mai thanh cong !",
                data = promotion
            });

        }

        [HttpPost("import-excel")]
        public async Task<IActionResult> ImportExcel([FromBody] List<Promotion> data)
        {
            if (data == null || !data.Any())
                return BadRequest("Dữ liệu rỗng");

            foreach (var item in data)
            {
                await _context.Promotions.AddAsync(item); 
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Lưu dữ liệu thành công" });
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePromotion(int id, Promotion promotion)
        {
            var existingPromotion = await _context.Promotions.FindAsync(id);
            if(existingPromotion == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy khuyến mãi!" });
            }
            existingPromotion.PromotionName = promotion.PromotionName;
            existingPromotion.PromotionType = promotion.PromotionType;
            existingPromotion.StartDate = promotion.StartDate;
            existingPromotion.EndDate = promotion.EndDate;
            existingPromotion.Quantity = promotion.Quantity;
            existingPromotion.ProductTypeId = promotion.ProductTypeId;
            existingPromotion.IsPoints = promotion.IsPoints;
            existingPromotion.Condition = promotion.Condition;
            existingPromotion.RankId = promotion.RankId;
            existingPromotion.UrlImage = promotion.UrlImage;
            existingPromotion.IsDeleted = promotion.IsDeleted;
            existingPromotion.Status = promotion.Status;
            existingPromotion.Value_data = promotion.Value_data;

            _context.Promotions.Update(existingPromotion);
            await _context.SaveChangesAsync();
            return Ok(new
            {
                success = true,
                message = "Cập nhật khuyến mãi thành công!",
                data = existingPromotion
            });
        }
        [HttpPost("UploadImage")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { success = false, message = "Không có ảnh để upload!" });
            }

            // Đường dẫn thư mục wwwroot/Uploads/Images
            var uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Uploads", "Images");
            if (!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }

            // Lưu file vào thư mục
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadFolder, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Trả về đường dẫn ảnh
            var imageUrl = $"/Uploads/Images/{fileName}";
            return Ok(new { success = true, url = imageUrl });
        }

        [HttpDelete("DeletePromotion/{id}")]
        public async Task<IActionResult> DeletePromotion(int id)
        {
            var promotion = await _context.Promotions.FindAsync(id);
            if (promotion == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy khuyến mãi để xóa!" });
            }

            _context.Promotions.Remove(promotion);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Xóa khuyến mãi thành công!" });
        }

    }
}
