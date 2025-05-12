using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NailsTcsoft3.Data;
using NailsTcsoft3.Models;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ThuctapKtktcnNail2025Context _context;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;
        public ProductsController(ThuctapKtktcnNail2025Context context, IConfiguration configuration, IWebHostEnvironment environment)
        {
            _context = context;
            _configuration = configuration;
            _environment = environment;
        }

        // GET: Products
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _context.ProductAndServices
                .Where(x => !x.IsDeleted)
                .ToListAsync();

            if (!products.Any())
            {
                return Ok(new
                {
                    success = false,
                    message = "Không có sản phẩm nào"
                });
            }

            return Ok(new
            {
                success = true,
                message = "Lấy danh sách sản phẩm thành công",
                data = products
            });
        }


        // POST: Products/PostProduct
        [HttpPost("PostProduct")]
        public async Task<IActionResult> PostProduct([FromForm] ProductForm request)
        {
            // 1. Validate
            if( await _context.ProductAndServices.AnyAsync(p => p.ProAndSerCode == request.ProAndSerCode))
            {
                return BadRequest(new { Message = "Mã sản phẩm đã tồn tại" });
            }

            var product = new ProductAndService
            {
                ProAndSerName = request.ProAndSerName,
                ProAndSerType = request.ProAndSerType,
                OriginalPrice = request.OriginalPrice,
                SellingPrice = request.SellingPrice,
                WorkTime = request.WorkTime,
                InventoryQuantity = request.InventoryQuantity,
                Unit = request.Unit,
                ProductTypeId = request.ProductTypeId,
                Commission = request.Commission,
                IsDeleted = false,
                Status = request.Status,
                ExpiryDate = request.ExpiryDate,
                Description = request.Description
            };

            await _context.ProductAndServices.AddAsync(product);
            await _context.SaveChangesAsync(); // Lưu để lấy ID
            if (request.ProAndSerCode.IsNullOrEmpty())
            {
                // TẠO MÃ TỰ ĐỘNG THEO CÔNG THỨC: [prefix] + "00000" + [Id] ⭐
                string prefix = product.ProAndSerType switch
                {
                    1 => "SP", // Sản phẩm
                    2 => "DV", // Dịch vụ
                    _ => "OT"  // Khác
                };

                product.ProAndSerCode = $"{prefix}00000{product.ProAndSerId}";
                await _context.SaveChangesAsync();
            }
            // 4. Xử lý ảnh (lưu vào wwwroot)
            if (request.Images?.Count > 0)
            {
                var uploadsDir = Path.Combine(_environment.WebRootPath, "uploads", "products");
                Directory.CreateDirectory(uploadsDir);

                List<string> imageUrls = new List<string>();

                foreach (var image in request.Images)
                {
                    if (image.Length > 0)
                    {
                        // Tạo tên file unique
                        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
                        var filePath = Path.Combine(uploadsDir, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await image.CopyToAsync(stream);
                        }

                        // Lưu URL vào DB
                        var imageUrl = $"/uploads/products/{fileName}";
                        var imageproduct = new ProAndSerImage
                        {
                            ImageUrl = imageUrl,
                            ProAndSerId = product.ProAndSerId,
                        };

                        imageUrls.Add(imageUrl); // Store the URLs
                        await _context.ProAndSerImages.AddAsync(imageproduct);
                    }
                }

                // Save the first image URL as the product's main image
                if (imageUrls.Any())
                {
                    product.UrlImage = imageUrls.First(); // Set the first image URL as the main image
                    await _context.SaveChangesAsync(); // Save changes to product
                }
            }

            return Ok(new
            {
                ProductId = product.ProAndSerId,
                ProductCode = product.ProAndSerCode, // Ví dụ: "DV00000123"
            });
        }



        // PUT: Products/PutProduct/{id}
        [HttpPut("PutProduct/{id}")]
        public async Task<IActionResult> PutProduct(int id, [FromBody] ProductAndService product)
        {
            var existingProduct = await _context.ProductAndServices.FindAsync(id);
            if (existingProduct == null || existingProduct.IsDeleted)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy nhóm hàng"
                });
            }

            // Cập nhật các trường (bạn có thể điều chỉnh theo yêu cầu)
            existingProduct.ProAndSerCode = product.ProAndSerCode;
            existingProduct.ProAndSerName = product.ProAndSerName;
            existingProduct.Commission = product.Commission;
            existingProduct.ProAndSerType = product.ProAndSerType;
            existingProduct.InventoryQuantity = product.InventoryQuantity;
            existingProduct.OriginalPrice = product.OriginalPrice;
            existingProduct.ProductTypeId = product.ProductTypeId;
            existingProduct.Status = product.Status;
            existingProduct.Unit = product.Unit;
            existingProduct.UrlImage = product.UrlImage;
            existingProduct.WorkTime = product.WorkTime;
            // Nếu cần cập nhật thêm các trường khác thì thực hiện ở đây

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Cập nhật customer rank thành công",
                data = existingProduct
            });
        }

        // GET: Products/GetById/{id}
        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _context.ProductAndServices
                .Where(x => !x.IsDeleted && x.ProAndSerId == id)
                .FirstOrDefaultAsync();

            if (product == null)
            {
                return NotFound();
            }

            return Ok(product);
        }



        [HttpGet("GetByFilter")]
        public async Task<IActionResult> GetByFilter([FromQuery] ProductFilter filter)
        {
            // Ensure valid pagination parameters
            if (filter.PageNumber <= 0)
            {
                filter.PageNumber = 1;
            }

            if (filter.PageSize <= 0)
            {
                filter.PageSize = 5; // Default to 5 items per page as requested
            }

            // B1: Lấy danh sách sản phẩm thường
            var normalQuery = _context.ProductAndServices.AsQueryable();
            normalQuery = normalQuery.Where(p => !p.IsDeleted);

            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                normalQuery = normalQuery.Where(p => p.ProAndSerName.Contains(filter.SearchTerm)
                                                   || p.ProAndSerCode.Contains(filter.SearchTerm));
            }

            var productTypes = filter.ProductTypesArray;
            if (productTypes != null && productTypes.Length > 0)
            {
                normalQuery = normalQuery.Where(p => productTypes.Contains(p.ProAndSerType));
            }

            if (filter.ProductGroup > 0)
            {
                normalQuery = normalQuery.Where(p => p.ProductTypeId == filter.ProductGroup);
            }

            if (filter.Status > 0)
            {
                normalQuery = normalQuery.Where(p => p.Status == filter.Status);
            }

            var normalProducts = await normalQuery.ToListAsync();

            // B2: Nếu có rank > 0, lấy danh sách sản phẩm theo rank (chỉ cần lấy các trường cần thiết)
            Dictionary<int, decimal> rankPrices = new Dictionary<int, decimal>();
            if (filter.Rank > 0)
            {
                var priceList = await _context.PriceLists
                    .FirstOrDefaultAsync(x => x.RankId == filter.Rank);

                if (priceList != null)
                {
                    var rankQuery = from p in _context.ProductAndServices
                                    join d in _context.PriceListDetails
                                      on p.ProAndSerId equals d.ProductId
                                    where d.PriceListId == priceList.PriceListId && !p.IsDeleted
                                    select new
                                    {
                                        p.ProAndSerId,
                                        d.SellPrice
                                    };

                    // Áp dụng lại các điều kiện lọc nếu cần (tương tự như normalProducts)
                    if (!string.IsNullOrEmpty(filter.SearchTerm))
                    {
                        rankQuery = rankQuery.Where(x =>
                            _context.ProductAndServices
                                .Where(p => p.ProAndSerId == x.ProAndSerId)
                                .Any(p => p.ProAndSerName.Contains(filter.SearchTerm) || p.ProAndSerCode.Contains(filter.SearchTerm)));
                    }
                    if (productTypes != null && productTypes.Length > 0)
                    {
                        rankQuery = rankQuery.Where(x =>
                            _context.ProductAndServices
                                .Where(p => p.ProAndSerId == x.ProAndSerId)
                                .Any(p => productTypes.Contains(p.ProAndSerType)));
                    }

                    if (filter.ProductGroup > 0)
                    {
                        rankQuery = rankQuery.Where(x =>
                            _context.ProductAndServices
                                .Where(p => p.ProAndSerId == x.ProAndSerId)
                                .Any(p => p.ProductTypeId == filter.ProductGroup));
                    }

                    if (filter.Status > 0)
                    {
                        rankQuery = rankQuery.Where(x =>
                                    _context.ProductAndServices
                                        .Where(p => p.ProAndSerId == x.ProAndSerId)
                                        .Any(p => p.Status == filter.Status));
                    }

                    // Lấy ra kết quả và tạo dictionary: key là ProAndSerId, value là SellingPrice
                    var rankList = await rankQuery.ToListAsync();
                    rankPrices = rankList.ToDictionary(x => x.ProAndSerId, x => x.SellPrice);
                }
            }

            // B3: Cập nhật SellingPrice cho sản phẩm thường nếu có giá từ rank
            if (rankPrices.Any())
            {
                foreach (var product in normalProducts)
                {
                    if (rankPrices.ContainsKey(product.ProAndSerId))
                    {
                        product.SellingPrice = rankPrices[product.ProAndSerId];
                    }
                }
            }

            // B4: Phân trang
            var totalItems = normalProducts.Count;
            var totalPages = (int)Math.Ceiling(totalItems / (double)filter.PageSize);

            var pagedProducts = normalProducts
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToList();

            if (!pagedProducts.Any())
            {
                return Ok(new
                {
                    success = false,
                    message = "Không có sản phẩm nào",
                    data = new List<ProductAndService>(),
                    totalItems = 0,
                    totalPages = 0,
                    currentPage = filter.PageNumber
                });
            }

            return Ok(new
            {
                success = true,
                message = "Lấy danh sách sản phẩm thành công",
                data = pagedProducts,
                totalItems,
                totalPages,
                currentPage = filter.PageNumber
            });
        }
        // DELETE: Products/DeleteProduct/{id}
        [HttpDelete("DeleteProduct/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.ProductAndServices.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            // Cập nhật thuộc tính IsDeleted thành true thay vì xóa bản ghi
            product.IsDeleted = true;
            _context.Entry(product).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProductExists(int id)
        {
            return _context.ProductAndServices.Any(e => e.ProAndSerId == id);
        }
    }
}
