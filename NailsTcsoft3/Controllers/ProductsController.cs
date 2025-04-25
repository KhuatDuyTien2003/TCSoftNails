using Azure.Core;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NailsTcsoft3.Data;
using NailsTcsoft3.Models;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using static Azure.Core.HttpHeader;
using static System.Net.Mime.MediaTypeNames;

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
            if (await _context.ProductAndServices.AnyAsync(p => p.ProAndSerCode == request.ProAndSerCode))
            {
                return BadRequest(new { Message = "Mã sản phẩm đã tồn tại" });
            }

            var product = new ProductAndService
            {
                ProAndSerName = request.ProAndSerName,
                ProAndSerCode = request.ProAndSerCode,
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
            if (product.ProAndSerCode.IsNullOrEmpty())
            {
                string prefix = product.ProAndSerType switch
                {
                    1 => "SP", // Sản phẩm
                    2 => "DV", // Dịch vụ
                    _ => "CB"  // Khác
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


        [HttpPost("PostCombo")]
        public async Task<IActionResult> PostCombo([FromForm] ProductForm request)
        {
            // Kiểm tra mã sản phẩm có tồn tại chưa
            if (await _context.ProductAndServices.AnyAsync(p => p.ProAndSerCode == request.ProAndSerCode))
            {
                return BadRequest(new { success = false, message = "Mã sản phẩm đã tồn tại" });
            }

            // Tạo combo (cũng là một ProductAndService)
            var combo = new ProductAndService
            {
                ProAndSerName = request.ProAndSerName,
                ProAndSerCode = request.ProAndSerCode,
                ProAndSerType = request.ProAndSerType, // Có thể là loại "Combo"
                OriginalPrice = request.OriginalPrice,
                SellingPrice = request.SellingPrice,
                WorkTime = request.WorkTime,
                InventoryQuantity = request.InventoryQuantity,
                Unit = request.Unit,
                ProductTypeId = request.ProductTypeId,
                Commission = request.Commission,
                Status = request.Status,
                Description = request.Description,
                ExpiryDate = request.ExpiryDate,
                IsDeleted = false
            };

            await _context.ProductAndServices.AddAsync(combo);
            await _context.SaveChangesAsync();

            // Gán mã tự động nếu chưa có
            if (combo.ProAndSerCode.IsNullOrEmpty())
            {
                string prefix = combo.ProAndSerType switch
                {
                    1 => "SP",
                    2 => "DV",
                    _ => "CB" // Combo
                };
                combo.ProAndSerCode = $"{prefix}00000{combo.ProAndSerId}";
                await _context.SaveChangesAsync();
            }

            // Gán các sản phẩm thành phần (được gửi từ FormData)
            if (!string.IsNullOrEmpty(request.SelectedProducts))
            {
                try
                {
                    var selectedProducts = JsonSerializer.Deserialize<List<SelectedProductDto>>(request.SelectedProducts);

                    foreach (var item in selectedProducts)
                    {
                        var comboItem = new ComboDetail
                        {
                            ComboId = combo.ProAndSerId,
                            ServiceId = item.proAndSerId,
                            Quantity = item.quantity
                        };
                        await _context.ComboDetails.AddAsync(comboItem);
                    }
                }
                catch (Exception ex)
                {
                    return BadRequest(new { success = false, message = "Lỗi xử lý sản phẩm thành phần: " + ex.Message });
                }
            }

            // Xử lý ảnh
            if (request.Images?.Count > 0)
            {
                var uploadsDir = Path.Combine(_environment.WebRootPath, "uploads", "products");
                Directory.CreateDirectory(uploadsDir);

                List<string> imageUrls = new List<string>();

                foreach (var image in request.Images)
                {
                    if (image.Length > 0)
                    {
                        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
                        var filePath = Path.Combine(uploadsDir, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await image.CopyToAsync(stream);
                        }

                        var imageUrl = $"/uploads/products/{fileName}";
                        var imageEntity = new ProAndSerImage
                        {
                            ImageUrl = imageUrl,
                            ProAndSerId = combo.ProAndSerId
                        };
                        imageUrls.Add(imageUrl);
                        await _context.ProAndSerImages.AddAsync(imageEntity);
                    }
                }

                if (imageUrls.Any())
                {
                    combo.UrlImage = imageUrls.First();
                    await _context.SaveChangesAsync();
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Thêm combo thành công!",
                comboId = combo.ProAndSerId,
                comboCode = combo.ProAndSerCode
            });
        }

        [HttpGet("GetDetailCombo/{id}")]
        public async Task<IActionResult> GetDetailCombo(int id)
        {
            // Kiểm tra combo và lấy thông tin chi tiết
            var combo = await _context.ProductAndServices
                .Where(p => p.ProAndSerId == id && !p.IsDeleted && p.ProAndSerType == 3)
                .Select(p => new
                {
                    p.ProAndSerId,
                    p.ProAndSerName,
                    p.SellingPrice,
                })
                .FirstOrDefaultAsync();

            if (combo == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy combo"
                });
            }

            var comboDetails = await _context.ComboDetails
                .Where(cd => cd.ComboId == id && !cd.IsDeleted)
                .Join(_context.ProductAndServices,
                      cd => cd.ServiceId,
                      p => p.ProAndSerId,
                      (cd, p) => new
                      {
                          p.ProAndSerId,
                          p.ProAndSerCode,
                          p.ProAndSerName,
                          p.SellingPrice,
                          cd.Quantity
                      })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                message = "Lấy chi tiết combo thành công",
                data = comboDetails
            });
        }
        // GET: Products/GetImagesByProductId/{id}
        [HttpGet("GetImagesByProductId/{id}")]
        public async Task<IActionResult> GetImagesByProductId(int id)
        {
            // Check if the product exists
            var productExists = await _context.ProductAndServices.AnyAsync(p => p.ProAndSerId == id && !p.IsDeleted);
            if (!productExists)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy sản phẩm"
                });
            }

            // Retrieve the list of images for the product
            var domain = $"{Request.Scheme}://{Request.Host}";
            var images = await _context.ProAndSerImages
                .Where(img => img.ProAndSerId == id)
            .Select(img => new
            {
                ImageId = img.ImageId,
                ImageUrl = $"{domain}{img.ImageUrl}"

            })
                .ToListAsync();

            if (!images.Any())
            {
                return Ok(new
                {
                    success = false,
                    message = "Không có ảnh nào cho sản phẩm này"
                });
            }

            return Ok(new
            {
                success = true,
                message = "Lấy danh sách ảnh thành công",
                data = images
            });
        }

        [HttpPut("PutProduct/{id}")]
        public async Task<IActionResult> PutProduct(int id, [FromForm] ProductForm dto)
        {
            //Kiểm tra sản phẩm
            var existingProduct = await _context.ProductAndServices
                .FirstOrDefaultAsync(p => p.ProAndSerId == id && !p.IsDeleted);
            if (existingProduct == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy sản phẩm"
                });
            }


            // Xử lý ảnh: XÓA ảnh không giữ lại
            var existingImages = await _context.ProAndSerImages
                .Where(img => img.ProAndSerId == id)
                .ToListAsync();

            if (dto.ImageIds == null || dto.ImageIds.Length == 0)
            {
                // Xóa tất cả ảnh nếu không giữ ảnh nào
                foreach (var img in existingImages)
                {
                    var path = Path.Combine(_environment.WebRootPath, img.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(path))
                    {
                        System.IO.File.Delete(path);
                    }
                }

                _context.ProAndSerImages.RemoveRange(existingImages);
            }
            else
            {
                var imagesToRemove = existingImages
                    .Where(img => !dto.ImageIds.Contains(img.ImageId))
                    .ToList();

                foreach (var img in imagesToRemove)
                {
                    var path = Path.Combine(_environment.WebRootPath, img.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(path))
                    {
                        System.IO.File.Delete(path);
                    }
                }

                _context.ProAndSerImages.RemoveRange(imagesToRemove);
            }

            //Xử lý ảnh mới: THÊM mới vào thư mục + DB
            if (dto.Images != null && dto.Images.Any())
            {
                var uploadsDir = Path.Combine(_environment.WebRootPath, "uploads", "products");
                Directory.CreateDirectory(uploadsDir);

                foreach (var image in dto.Images)
                {
                    if (image != null)
                    {
                        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
                        var filePath = Path.Combine(uploadsDir, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await image.CopyToAsync(stream);
                        }

                        var imageUrl = $"/uploads/products/{fileName}";

                        var newImage = new ProAndSerImage
                        {
                            ProAndSerId = id,
                            ImageUrl = imageUrl
                        };

                        await _context.ProAndSerImages.AddAsync(newImage);
                    }
                }
            }
            await _context.SaveChangesAsync();
            // Cập nhật thông tin và ảnh đại diện (lấy 1 ảnh đầu tiên)
            var currentImages = await _context.ProAndSerImages
                .Where(i => i.ProAndSerId == id)
                .OrderBy(i => i.ImageId)
                .ToListAsync();

            existingProduct.ProAndSerCode = dto.ProAndSerCode;
            existingProduct.ProAndSerName = dto.ProAndSerName;
            existingProduct.Commission = dto.Commission;
            existingProduct.ProAndSerType = dto.ProAndSerType;
            existingProduct.InventoryQuantity = dto.InventoryQuantity;
            existingProduct.OriginalPrice = dto.OriginalPrice;
            existingProduct.ProductTypeId = dto.ProductTypeId;
            existingProduct.Status = dto.Status;
            existingProduct.Unit = dto.Unit;
            existingProduct.WorkTime = dto.WorkTime;
            existingProduct.Description = dto.Description;
            existingProduct.ExpiryDate = dto.ExpiryDate;
            existingProduct.UrlImage = currentImages.FirstOrDefault()?.ImageUrl;

            // Lưu toàn bộ thay đổi
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Cập nhật sản phẩm thành công",
                data = existingProduct
            });
        }


        [HttpPut("PutCombo/{id}")]
        public async Task<IActionResult> PutCombo(int id, [FromForm] ProductForm dto)
        {
            // 1. Kiểm tra combo có tồn tại hay không
            var existingCombo = await _context.ProductAndServices
                .FirstOrDefaultAsync(p => p.ProAndSerId == id && !p.IsDeleted && p.ProAndSerType == 3);
            if (existingCombo == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy combo"
                });
            }

            // 2. Cập nhật thông tin cơ bản của combo
            existingCombo.ProAndSerName = dto.ProAndSerName;
            existingCombo.SellingPrice = dto.SellingPrice;
            existingCombo.OriginalPrice = dto.OriginalPrice;
            existingCombo.Description = dto.Description;
            existingCombo.Status = dto.Status;
            existingCombo.ExpiryDate = dto.ExpiryDate;
            existingCombo.Commission = dto.Commission;
            existingCombo.WorkTime = dto.WorkTime;
            existingCombo.InventoryQuantity = dto.InventoryQuantity;
            existingCombo.Unit = dto.Unit;
            existingCombo.ProductTypeId = dto.ProductTypeId;

            // 3. Xử lý các sản phẩm/dịch vụ thành phần trong combo

            var existingDetails = await _context.ComboDetails
                 .Where(cd => cd.ComboId == id)
                 .ToListAsync();
            _context.ComboDetails.RemoveRange(existingDetails);

            if (!string.IsNullOrEmpty(dto.SelectedProducts))
            {
                try
                {
                    var selectedProducts = JsonSerializer.Deserialize<List<SelectedProductDto>>(dto.SelectedProducts);

                    foreach (var item in selectedProducts)
                    {
                        var comboItem = new ComboDetail
                        {
                            ComboId = id,
                            ServiceId = item.proAndSerId,
                            Quantity = item.quantity
                        };
                        await _context.ComboDetails.AddAsync(comboItem);
                    }
                }
                catch (Exception ex)
                {
                    return BadRequest(new { success = false, message = "Lỗi xử lý sản phẩm thành phần: " + ex.Message });
                }
            }


            // 4. Xử lý ảnh
            var existingImages = await _context.ProAndSerImages
                .Where(img => img.ProAndSerId == id)
                .ToListAsync();

            if (dto.ImageIds == null || dto.ImageIds.Length == 0)
            {
                // Xóa tất cả ảnh nếu không giữ lại ảnh nào
                foreach (var img in existingImages)
                {
                    var path = Path.Combine(_environment.WebRootPath, img.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(path))
                    {
                        System.IO.File.Delete(path);
                    }
                }
                _context.ProAndSerImages.RemoveRange(existingImages);
            }
            else
            {
                // Xóa các ảnh không còn được giữ lại
                var imagesToRemove = existingImages
                    .Where(img => !dto.ImageIds.Contains(img.ImageId))
                    .ToList();

                foreach (var img in imagesToRemove)
                {
                    var path = Path.Combine(_environment.WebRootPath, img.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(path))
                    {
                        System.IO.File.Delete(path);
                    }
                }
                _context.ProAndSerImages.RemoveRange(imagesToRemove);
            }

            // Thêm ảnh mới
            if (dto.Images != null && dto.Images.Any())
            {
                var uploadsDir = Path.Combine(_environment.WebRootPath, "uploads", "products");
                Directory.CreateDirectory(uploadsDir);

                foreach (var image in dto.Images)
                {
                    if (image != null)
                    {
                        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
                        var filePath = Path.Combine(uploadsDir, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await image.CopyToAsync(stream);
                        }

                        var imageUrl = $"/uploads/products/{fileName}";

                        var newImage = new ProAndSerImage
                        {
                            ProAndSerId = id,
                            ImageUrl = imageUrl
                        };

                        await _context.ProAndSerImages.AddAsync(newImage);
                    }
                }
            }
             await _context.SaveChangesAsync();
            // Cập nhật ảnh đại diện (lấy ảnh đầu tiên nếu có)
            var currentImages = await _context.ProAndSerImages
                .Where(i => i.ProAndSerId == id)
                .OrderBy(i => i.ImageId)
                .ToListAsync();
            existingCombo.UrlImage = currentImages.FirstOrDefault()?.ImageUrl;

            // 5. Lưu thay đổi
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Cập nhật combo thành công",
                data = existingCombo
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
            if (filter.Stock > 0)
            {
                switch (filter.Stock)
                {
                    case 1:
                        normalQuery = normalQuery.Where(p => p.InventoryQuantity > 0);
                        break;
                    case 2:
                        normalQuery = normalQuery.Where(p => p.InventoryQuantity == 0);
                        break;
                    default:
                        break;
                }
            }

            var normalProducts = await normalQuery
                                  .OrderBy(p => p.ProAndSerType)
                                  .ToListAsync();

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

            return Ok(new
            {
                success = true,
                message = "Xóa sản phẩm thành công",
            });
        }
        // DELETE: Products/DeleteMultipleProducts
        [HttpPost("DeleteMultipleProducts")]
        public async Task<IActionResult> DeleteMultipleProducts([FromBody] List<int> productIds)
        {
            if (productIds == null || !productIds.Any())
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Danh sách sản phẩm cần xóa không hợp lệ"
                });
            }

            // Fetch the products to be deleted
            var productsToDelete = await _context.ProductAndServices
                .Where(p => productIds.Contains(p.ProAndSerId) && !p.IsDeleted)
                .ToListAsync();

            if (!productsToDelete.Any())
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy sản phẩm nào để xóa"
                });
            }

            // Mark products as deleted
            foreach (var product in productsToDelete)
            {
                product.IsDeleted = true;
            }

            // Save changes to the database
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Xóa sản phẩm thành công",
                deletedProductIds = productIds
            });
        }
        // POST: Products/RestoreProduct/{id}
        [HttpPost("RestoreProduct/{id}")]
        public async Task<IActionResult> RestoreProduct(int id)
        {
            // Find the product by ID
            var product = await _context.ProductAndServices
                .FirstOrDefaultAsync(p => p.ProAndSerId == id && p.IsDeleted);

            if (product == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy sản phẩm để khôi phục"
                });
            }

            // Mark the product as not deleted
            product.IsDeleted = false;

            // Save changes to the database
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Khôi phục sản phẩm thành công",
                restoredProductId = id
            });
        }
        // POST: Products/RestoreMultipleProducts
        [HttpPost("RestoreMultipleProducts")]
        public async Task<IActionResult> RestoreMultipleProducts([FromBody] List<int> productIds)
        {
            if (productIds == null || !productIds.Any())
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Danh sách sản phẩm cần khôi phục không hợp lệ"
                });
            }

            // Fetch the products to be restored
            var productsToRestore = await _context.ProductAndServices
                .Where(p => productIds.Contains(p.ProAndSerId) && p.IsDeleted)
                .ToListAsync();

            if (!productsToRestore.Any())
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy sản phẩm nào để khôi phục"
                });
            }

            // Mark products as not deleted
            foreach (var product in productsToRestore)
            {
                product.IsDeleted = false;
            }

            // Save changes to the database
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Khôi phục sản phẩm thành công",
                restoredProductIds = productIds
            });
        }
        // POST: Products/RestoreAllProducts
        [HttpPost("RestoreAllProducts")]
        public async Task<IActionResult> RestoreAllProducts()
        {
            // Find all deleted products
            var deletedProducts = await _context.ProductAndServices
                .Where(p => p.IsDeleted)
                .ToListAsync();

            if (!deletedProducts.Any())
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không có sản phẩm nào để khôi phục"
                });
            }

            // Mark all products as not deleted
            foreach (var product in deletedProducts)
            {
                product.IsDeleted = false;
            }

            // Save changes to the database
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Khôi phục tất cả sản phẩm thành công",
                restoredProductCount = deletedProducts.Count
            });
        }
        [HttpGet("GetProductsBySearch/{search}")]
        public async Task<IActionResult> GetProductsBySearch(string search)
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
            var products = await _context.ProductAndServices
                .Where(p => !p.IsDeleted && p.Status != 2)
                .ToListAsync();

            // Apply RemoveDiacritics in memory
            var results = products
                .Where(p => RemoveDiacritics(p.ProAndSerName.ToLower()).Contains(normalizedSearch) ||
                            RemoveDiacritics(p.ProAndSerCode.ToLower()).Contains(normalizedSearch))
                .Select(p => new
                {
                    p.ProAndSerId,
                    p.ProAndSerName,
                    p.ProAndSerCode,
                    p.SellingPrice,
                    p.InventoryQuantity,
                    p.UrlImage,
                })
                .ToList();

            if (!results.Any())
            {
                return Ok(new
                {
                    success = false,
                    message = "Không tìm thấy sản phẩm hoặc dịch vụ nào"
                });
            }

            return Ok(new
            {
                success = true,
                message = "Lấy danh sách sản phẩm và dịch vụ thành công",
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
        private bool ProductExists(int id)
        {
            return _context.ProductAndServices.Any(e => e.ProAndSerId == id);
        }
    }
}
