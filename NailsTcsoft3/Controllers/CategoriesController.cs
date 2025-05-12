using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailsTcsoft3.Data;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ThuctapKtktcnNail2025Context _context;
        private readonly IConfiguration _configuration;

        public CategoriesController(ThuctapKtktcnNail2025Context context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: Categories
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _context.Categories
                .Where(c => !c.IsDeleted)
                .ToListAsync();

            if (!categories.Any())
            {
                return Ok(new
                {
                    success = false,
                    message = "Không có danh mục nào"
                });
            }

            return Ok(new
            {
                success = true,
                message = "Lấy danh sách danh mục thành công",
                data = categories
            });
        }

        // GET: Categories/GetById/{id}
        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.CategoryId == id && !c.IsDeleted);

            if (category == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Danh mục không tồn tại"
                });
            }

            return Ok(category);
        }

        // POST: Categories/CreateCategory
        [HttpPost("CreateCategory")]
        public async Task<IActionResult> CreateCategory([FromBody] Category category)
        {
            if (category == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Dữ liệu không hợp lệ"
                });
            }

            // Create new category
            _context.Categories.Add(category);
            var result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                return Ok(new
                {
                    success = true,
                    message = "Thêm danh mục thành công"
                });
            }

            return BadRequest(new
            {
                success = false,
                message = "Thêm danh mục thất bại"
            });
        }

        // PUT: Categories/UpdateCategory/{id}
        [HttpPut("UpdateCategory/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category category)
        {
            var existingCategory = await _context.Categories.FindAsync(id);
            if (existingCategory == null || existingCategory.IsDeleted)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Danh mục không tìm thấy"
                });
            }

            // Update the fields
            existingCategory.CategoryName = category.CategoryName;
            existingCategory.Status = category.Status;

            // Save changes
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Cập nhật danh mục thành công",
                data = existingCategory
            });
        }

        // DELETE: Categories/DeleteCategory/{id}
        [HttpDelete("DeleteCategory/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Danh mục không tồn tại"
                });
            }

            // Soft delete by setting IsDeleted to true
            category.IsDeleted = true;
            _context.Entry(category).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CategoryExists(int id)
        {
            return _context.Categories.Any(c => c.CategoryId == id);
        }
    }
}
