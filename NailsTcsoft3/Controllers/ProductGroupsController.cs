using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailsTcsoft3.Data;
using NailsTcsoft3.Models;
using Microsoft.AspNetCore.Authorization;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ProductGroupsController : ControllerBase
    {
        private readonly ThuctapKtktcnNail2025Context _context;
        private readonly IConfiguration _configuration;

        public ProductGroupsController(ThuctapKtktcnNail2025Context context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: ProductGroups
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var productTypes = await _context.ProductTypes
                .Where(pt => !pt.IsDeleted)
                .ToListAsync();

            if (!productTypes.Any())
            {
                return Ok(new
                {
                    success = false,
                    message = "Không có loại sản phẩm nào"
                });
            }

            return Ok(new
            {
                success = true,
                message = "Lấy danh sách loại sản phẩm thành công",
                data = productTypes
            });
        }

        // GET: ProductGroups/GetById/{id}
        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var productType = await _context.ProductTypes
                .FirstOrDefaultAsync(pt => pt.ProductTypeId == id && !pt.IsDeleted);

            if (productType == null)
            {
                return NotFound();
            }

            return Ok(productType);
        }


        // POST: ProductGroups/CreateProductType
        [HttpPost("PostProductGroup")]
        [Authorize(policy: "PRODUCTGROUP:VIEW")]
        public async Task<IActionResult> PostProductGroup([FromBody] ProductGroupModel productmodel)
        {
            if (productmodel == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Dữ liệu không hợp lệ"
                });
            }

            ProductType productType = new ProductType
            {
                ProductTypeName = productmodel.ProductTypeName,
                CategoryId = productmodel.CategoryId,
                Status = productmodel.Status, 
                IsDeleted = false,
            }; 
            await _context.ProductTypes.AddAsync(productType);
            var result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                return Ok(new
                {
                    success = true,
                    message = "Thêm loại sản phẩm thành công"
                });
            }

            return BadRequest(new
            {
                success = false,
                message = "Thêm loại sản phẩm thất bại"
            });
        }

        // PUT: ProductGroupes/UpdateProductType/{id}
        [HttpPut("PutProductGroup/{id}")]
        public async Task<IActionResult> PutProductGroup(int id, [FromBody] ProductGroupModel productGroup)
        {
            var existingProductGroup = await _context.ProductTypes.FindAsync(id);
            if (existingProductGroup == null || existingProductGroup.IsDeleted)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy nhóm hàng"
                });
            }

            // Cập nhật các trường (bạn có thể điều chỉnh theo yêu cầu)
            existingProductGroup.ProductTypeName = productGroup.ProductTypeName;
            existingProductGroup.Status = productGroup.Status;
            existingProductGroup.CategoryId = productGroup.CategoryId;

            // Nếu cần cập nhật thêm các trường khác thì thực hiện ở đây

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Cập nhật customer rank thành công",
                data = existingProductGroup
            });
        }

        // DELETE: ProductGroups/DeleteProductType/{id}
        [HttpDelete("DeleteProductGroup/{id}")]
        public async Task<IActionResult> DeleteProductGroup(int id)
        {
            var productType = await _context.ProductTypes.FindAsync(id);
            if (productType == null)
            {
                return NotFound();
            }

            // Thực hiện xóa mềm: cập nhật IsDeleted thành true
            productType.IsDeleted = true;
            _context.Entry(productType).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProductGroupExists(int id)
        {
            return _context.ProductTypes.Any(pt => pt.ProductTypeId == id);
        }
    }
}
