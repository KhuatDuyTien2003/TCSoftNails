using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailsTcsoft3.Data;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class SuppliersController : ControllerBase
    {
        private readonly ThuctapKtktcnNail2025Context _context;
        public SuppliersController(ThuctapKtktcnNail2025Context context)
        {
            _context = context;
        }

        // Lấy tất cả nhà cung cấp (không bị xóa)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var suppliers = await _context.Suppliers
                .Where(s => !s.IsDeleted)
                .ToListAsync();
            return Ok(new { success = true, data = suppliers });
        }

        // Lấy nhà cung cấp theo id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var supplier = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.SupplierId == id && !s.IsDeleted);
            if (supplier == null)
                return NotFound(new { success = false, message = "Không tìm thấy nhà cung cấp." });
            return Ok(new { success = true, data = supplier });
        }

        // Thêm mới nhà cung cấp
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Supplier request)
        {
            if (request == null)
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });

            request.IsDeleted = false;
            await _context.Suppliers.AddAsync(request);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Thêm nhà cung cấp thành công.", data = request });
        }

        // Cập nhật nhà cung cấp
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Supplier request)
        {
            var supplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.SupplierId == id && !s.IsDeleted);
            if (supplier == null)
                return NotFound(new { success = false, message = "Không tìm thấy nhà cung cấp." });

            supplier.SupplierName = request.SupplierName;
            supplier.Phone = request.Phone;
            supplier.Address = request.Address;
            supplier.Email = request.Email;
            // Thêm các trường khác nếu có

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Cập nhật nhà cung cấp thành công.", data = supplier });
        }

        // Xóa mềm nhà cung cấp
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var supplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.SupplierId == id && !s.IsDeleted);
            if (supplier == null)
                return NotFound(new { success = false, message = "Không tìm thấy nhà cung cấp." });

            supplier.IsDeleted = true;
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Xóa nhà cung cấp thành công." });
        }

        [HttpGet("GetSuppliersBySearch/{search}")]
        public async Task<IActionResult> GetSuppliersBySearch(string search)
        {
            if (string.IsNullOrWhiteSpace(search))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Từ khóa tìm kiếm không hợp lệ"
                });
            }

            // Normalize the search term by removing diacritics
            var normalizedSearch = RemoveDiacritics(search.ToLower());

            // Fetch data from the database (without applying RemoveDiacritics in the query)
            var products = await _context.Suppliers
                .Where(p => !p.IsDeleted && p.IsDeleted != true)
                .ToListAsync();

            // Apply RemoveDiacritics in memory
            var results = products
                .Where(p => RemoveDiacritics(p.SupplierName.ToLower()).Contains(normalizedSearch))
                .ToList();

            if (!results.Any())
            {
                return Ok(new
                {
                    success = false,
                    message = "Không tìm thấy nhà cung cấp nào"
                });
            }

            return Ok(new
            {
                success = true,
                message = "Lấy danh sách nhà cung cấp thành công",
                data = results
            });
        }
        public static string RemoveDiacritics(string text)
        {
            if (string.IsNullOrEmpty(text))
                return text;

            // Replace Vietnamese diacritics with their base characters
            string[] vietnameseSigns = new string[]
            {
                "aAeEoOuUiIdDyY",
                "áàạảãâấầậẩẫăắằặẳẵ",
                "ÁÀẠẢÃÂẤẦẬẨẪĂẮẰẶẲẴ",
                "éèẹẻẽêếềệểễ",
                "ÉÈẸẺẼÊẾỀỆỂỄ",
                "óòọỏõôốồộổỗơớờợởỡ",
                "ÓÒỌỎÕÔỐỒỘỔỖƠỚỜỢỞỠ",
                "úùụủũưứừựửữ",
                "ÚÙỤỦŨƯỨỪỰỬỮ",
                "íìịỉĩ",
                "ÍÌỊỈĨ",
                "đ",
                "Đ",
                "ýỳỵỷỹ",
                "ÝỲỴỶỸ"
            };

            for (int i = 1; i < vietnameseSigns.Length; i++)
            {
                for (int j = 0; j < vietnameseSigns[i].Length; j++)
                {
                    text = text.Replace(vietnameseSigns[i][j], vietnameseSigns[0][i - 1]);
                }
            }

            return text;
        }
    }
}
