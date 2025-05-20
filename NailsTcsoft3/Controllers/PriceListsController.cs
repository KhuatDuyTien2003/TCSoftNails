
using Azure.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailsTcsoft3.Data;
using NailsTcsoft3.Models;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class PriceListsController : ControllerBase
    {
        private readonly ThuctapKtktcnNail2025Context _context;

        public PriceListsController(ThuctapKtktcnNail2025Context context)
        {
            _context = context;
        }
        [HttpGet("GetPriceList")]
        public IActionResult GetPriceList()
        {
            var priceList = _context.PriceLists.ToList();
            return Ok(priceList);
        }

        [HttpGet("{id}")]
        public IActionResult GetPriceListById(int id)
        {
            var priceList = _context.PriceLists.Find(id);
            if (priceList == null)
            {
                return NotFound();
            }
            return Ok(priceList);
        }

        [HttpPost("PostPriceList")]
        public async Task<IActionResult> PostPriceList([FromBody] PriceListForm request)
        {
            if (request == null)
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });

            // Kiểm tra thời gian
            if (request.StartTime >= request.EndTime)
                return BadRequest(new { success = false, message = "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc." });

            // Khởi tạo bảng giá mới
            var newPriceList = new PriceList
            {
                PriceListName = request.PriceListName,
                ValuePriceList = request.ValuePriceList,
                PriceListType = request.PriceListType,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                IsDeleted = false
            };

            await _context.PriceLists.AddAsync(newPriceList);
            await _context.SaveChangesAsync();

            // Chuẩn bị danh sách liên kết với Rank
            List<PriceListCustomerRank> priceListRanks = new();

            if (request.ApplyAll == true)
            {
                var allRanks = await _context.CustomerRanks.Select(r => r.RankId).ToListAsync();
                priceListRanks = allRanks.Select(rankId => new PriceListCustomerRank
                {
                    PriceListId = newPriceList.PriceListId,
                    RankId = rankId
                }).ToList();
            }
            else if (request.CustomerRankIds != null && request.CustomerRankIds.Any())
            {
                // Kiểm tra các RankId có hợp lệ không
                var validRanks = await _context.CustomerRanks
                    .Where(r => request.CustomerRankIds.Contains(r.RankId))
                    .Select(r => r.RankId)
                    .ToListAsync();

                var invalidRanks = request.CustomerRankIds.Except(validRanks).ToList();
                if (invalidRanks.Any())
                    return BadRequest(new { success = false, message = "Một số RankId không tồn tại.", invalidRanks });

                priceListRanks = validRanks.Select(rankId => new PriceListCustomerRank
                {
                    PriceListId = newPriceList.PriceListId,
                    RankId = rankId
                }).ToList();
            }

            if (priceListRanks.Any())
            {
                await _context.PriceListCustomerRanks.AddRangeAsync(priceListRanks);
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetPriceListById), new { id = newPriceList.PriceListId }, new
            {
                success = true,
                message = "Tạo bảng giá thành công.",
                data = newPriceList
            });
        }

        [HttpGet("GetPriceListCustomerRank/{id}")]
        public async Task<IActionResult> GetPriceListCustomerRank(int id)
        {
            var priceList = await _context.PriceLists
                .FirstOrDefaultAsync(pl => pl.PriceListId == id && !pl.IsDeleted);

            if (priceList == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Không tồn tại bảng giá này"
                });
            }

            var ranks = await (from plcr in _context.PriceListCustomerRanks
                               join cr in _context.CustomerRanks
                               on plcr.RankId equals cr.RankId
                               where plcr.PriceListId == id
                               select new
                               {
                                   rankId = plcr.RankId,
                                   rankName = cr.RankName
                               }).ToListAsync();

            return Ok(new
            {
                success = true,
                message = "Lấy danh sách bảng giá thành công",
                data = ranks
            });
        }

        [HttpPut("PutPriceList/{id}")]
        public async Task<IActionResult> PutPriceList(int id, [FromBody] PriceListForm request)
        {
            if (request == null)
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });

            // Kiểm tra thời gian
            if (request.StartTime >= request.EndTime)
                return BadRequest(new { success = false, message = "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc." });

            // Tìm bảng giá cần cập nhật
            var priceList = await _context.PriceLists
                .FirstOrDefaultAsync(pl => pl.PriceListId == id && !pl.IsDeleted);

            if (priceList == null)
                return NotFound(new { success = false, message = "Không tìm thấy bảng giá cần cập nhật." });

            // Cập nhật thông tin
            priceList.PriceListName = request.PriceListName;
            priceList.ValuePriceList = request.ValuePriceList;
            priceList.PriceListType = request.PriceListType;
            priceList.StartTime = request.StartTime;
            priceList.EndTime = request.EndTime;
            priceList.Status = request.Status;

            // Xóa danh sách liên kết cũ (nếu có)
            var oldRanks = await _context.PriceListCustomerRanks
                .Where(x => x.PriceListId == id)
                .ToListAsync();

            _context.PriceListCustomerRanks.RemoveRange(oldRanks);

            // Chuẩn bị danh sách liên kết mới
            List<PriceListCustomerRank> priceListRanks = new();

            if (request.ApplyAll)
            {
                var allRanks = await _context.CustomerRanks.Select(r => r.RankId).ToListAsync();
                priceListRanks = allRanks.Select(rankId => new PriceListCustomerRank
                {
                    PriceListId = id,
                    RankId = rankId
                }).ToList();
            }
            else if (request.CustomerRankIds != null && request.CustomerRankIds.Any())
            {
                var validRanks = await _context.CustomerRanks
                    .Where(r => request.CustomerRankIds.Contains(r.RankId))
                    .Select(r => r.RankId)
                    .ToListAsync();

                var invalidRanks = request.CustomerRankIds.Except(validRanks).ToList();
                if (invalidRanks.Any())
                    return BadRequest(new { success = false, message = "Một số RankId không tồn tại.", invalidRanks });

                priceListRanks = validRanks.Select(rankId => new PriceListCustomerRank
                {
                    PriceListId = id,
                    RankId = rankId
                }).ToList();
            }

            if (priceListRanks.Any())
                await _context.PriceListCustomerRanks.AddRangeAsync(priceListRanks);

            // Lưu tất cả thay đổi
            await _context.SaveChangesAsync();


            if (request.PriceListType is not null && request.ValuePriceList is not null)
            {
                await SetPriceListDetail(id, request.PriceListType.Value, request.ValuePriceList.Value);
            }
            return Ok(new
            {
                success = true,
                message = "Cập nhật bảng giá thành công.",
                data = priceList
            });
        }

        private async Task SetPriceListDetail(int priceListId, bool priceListType, decimal valuePriceList)
        {
            var detailsWithProducts = await _context.PriceListDetails
                .Where(p => p.PriceListId == priceListId)
                .Join(_context.ProductAndServices.Where(p => !p.IsDeleted),
                      detail => detail.ProductId,
                      product => product.ProAndSerId,
                      (detail, product) => new { Detail = detail, Product = product })
                .ToListAsync();

            foreach (var item in detailsWithProducts)
            {
                var price = priceListType
                    ? item.Product.OriginalPrice + valuePriceList
                    : item.Product.OriginalPrice * (1 + valuePriceList / 100);
                if(price < 0)
                {
                    price = 0;
                }
                item.Detail.SellPrice = Math.Round(price, 0, MidpointRounding.AwayFromZero);
            }

            await _context.SaveChangesAsync();
        }
        public class GroupProductAddRequest
        {
            public int PriceListId { get; set; }
            public int IdGroupPro { get; set; }

        }

        [HttpPost("AddGroupProToList")]
        public async Task<IActionResult> AddGroupProToList([FromBody] GroupProductAddRequest request)
        {
            var priceList = await _context.PriceLists
                .FirstOrDefaultAsync(pl => pl.PriceListId == request.PriceListId && !pl.IsDeleted);

            if (priceList == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy bảng giá"
                });
            }

            var products = await _context.ProductAndServices
                .Where(p => p.ProductTypeId == request.IdGroupPro && !p.IsDeleted && p.ProAndSerType != 3)
                .ToListAsync();

            if (!products.Any())
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy sản phẩm nào trong nhóm"
                });
            }

            foreach (var product in products)
            {
                bool exists = await _context.PriceListDetails
                    .AnyAsync(pld => pld.PriceListId == request.PriceListId && pld.ProductId == product.ProAndSerId);

                if (exists) continue;

                if (priceList.PriceListType is not null && priceList.ValuePriceList is not null)
                {
                    if (priceList.PriceListType == true)
                    {
                        product.SellingPrice = product.OriginalPrice + priceList.ValuePriceList.Value;
                    }
                    else
                    {
                        product.SellingPrice = product.OriginalPrice * (product.OriginalPrice * priceList.ValuePriceList.Value / 100);
                    }
                    if (product.SellingPrice < 0)
                    {
                        product.SellingPrice = 0;
                    }
                    product.SellingPrice = Math.Round(product.SellingPrice, 0, MidpointRounding.AwayFromZero);
                }

                var priceListDetail = new PriceListDetail
                {
                    PriceListId = request.PriceListId,
                    ProductId = product.ProAndSerId,
                    SellPrice = product.SellingPrice
                };

                await _context.PriceListDetails.AddAsync(priceListDetail);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Thêm nhóm sản phẩm vào bảng giá thành công"
            });
        }
        public class AddProductToListRequest
        {
            public int PriceListId { get; set; }
            public int ProductId { get; set; }
        }

        [HttpPost("AddProductToList")]
        public async Task<IActionResult> AddProductToList([FromBody] AddProductToListRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });
            }

            // Kiểm tra bảng giá có tồn tại
            var priceList = await _context.PriceLists
                .FirstOrDefaultAsync(pl => pl.PriceListId == request.PriceListId && !pl.IsDeleted);

            if (priceList == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy bảng giá." });
            }

            // Kiểm tra sản phẩm có tồn tại
            var product = await _context.ProductAndServices
                .FirstOrDefaultAsync(p => p.ProAndSerId == request.ProductId && !p.IsDeleted);

            if (product == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy sản phẩm hợp lệ." });
            }

            // Kiểm tra sản phẩm đã có trong bảng giá chưa
            var existingDetail = await _context.PriceListDetails
                .FirstOrDefaultAsync(pld => pld.PriceListId == request.PriceListId && pld.ProductId == request.ProductId);

            if (existingDetail != null)
            {
                return Ok(new { success = false, message = "Sản phẩm đã tồn tại trong bảng giá." });
            }

            // Tính giá bán theo kiểu bảng giá
            decimal sellPrice = product.OriginalPrice;

            if (priceList.PriceListType.HasValue && priceList.ValuePriceList.HasValue)
            {
                if (priceList.PriceListType == true)
                {
                    sellPrice = product.OriginalPrice + priceList.ValuePriceList.Value;
                }
                else
                {
                    sellPrice = product.OriginalPrice * (1 + priceList.ValuePriceList.Value / 100);
                }

                if (sellPrice < 0) sellPrice = 0;
                sellPrice = Math.Round(sellPrice, 0, MidpointRounding.AwayFromZero);
            }

            // Thêm vào chi tiết bảng giá
            var detail = new PriceListDetail
            {
                PriceListId = request.PriceListId,
                ProductId = product.ProAndSerId,
                SellPrice = sellPrice
            };

            _context.PriceListDetails.Add(detail);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Thêm sản phẩm vào bảng giá thành công."
            });
        }

        [HttpGet("GetByFilter")]
        public async Task<IActionResult> GetByFilter([FromQuery] ProductFilter dto)
        {
            if (dto == null)
            {
                return BadRequest(new { success = false, message = "Thiếu thông tin lọc" });
            }

            var priceList = await _context.PriceLists
                .FirstOrDefaultAsync(pl => pl.PriceListId == dto.PriceListId && !pl.IsDeleted);

            if (priceList == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy bảng giá"
                });
            }

            var query = from pld in _context.PriceListDetails
                        join p in _context.ProductAndServices on pld.ProductId equals p.ProAndSerId
                        where pld.PriceListId == dto.PriceListId && !p.IsDeleted
                        orderby p.ProductTypeId descending
                        select new
                        {
                            p.ProAndSerId,
                            p.ProAndSerCode,
                            p.ProAndSerName,
                            p.OriginalPrice,
                            SellingPrice = pld.SellPrice,
                            p.ProductTypeId,
                            p.UrlImage
                        };
            if(dto.SearchTerm != null && dto.SearchTerm != "")
            {
                query = query.Where(p => p.ProAndSerName.Contains(dto.SearchTerm) || p.ProAndSerCode.Contains(dto.SearchTerm));
            }
            if (dto.ProductGroup != 0)
            {
                query = query.Where(p => p.ProductTypeId == dto.ProductGroup);
            }

            var totalItems = await query.CountAsync();

            var products = await query
                .Skip((dto.PageNumber - 1) * dto.PageSize)
                .Take(dto.PageSize)
                .ToListAsync();

            if (!products.Any())
            {
                return Ok(new
                {
                    success = false,
                    message = "Không tìm thấy sản phẩm nào phù hợp"
                });
            }

            var totalPages = (int)Math.Ceiling(totalItems / (double)dto.PageSize);

            return Ok(new
            {
                success = true,
                message = "Lấy danh sách sản phẩm thành công",
                data = products,
                totalItems,
                totalPages,
                currentPage = dto.PageNumber
            });
        }
        public class PriceListDetailUpdateRequest
        {
            public int PriceListId { get; set; }
            public int ProductId { get; set; }
            public decimal SellPrice { get; set; }
        }

        [HttpPut("UpdateSellingPrice")]
        public async Task<IActionResult> UpdateSellingPrice([FromBody] PriceListDetailUpdateRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { success = false, message = "Thiếu thông tin cập nhật" });
            }
            var existingPriceListDetail = await _context.PriceListDetails
                .FirstOrDefaultAsync(pld => pld.PriceListId == request.PriceListId && !pld.IsDelete && pld.ProductId == request.ProductId);
            if (existingPriceListDetail == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy chi tiết bảng giá" });
            }
            existingPriceListDetail.SellPrice = request.SellPrice;
            if (existingPriceListDetail.SellPrice < 0)
            {
                existingPriceListDetail.SellPrice = 0;
            }
            //lam tròn giá bán
            existingPriceListDetail.SellPrice = Math.Round(existingPriceListDetail.SellPrice, 0, MidpointRounding.AwayFromZero);
            // Cập nhật giá bán
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Cập nhật giá bán thành công" });
        }

        [HttpDelete("DeletePriceList/{id}")]
        public async Task<IActionResult> DeletePriceList(int id)
        {
            // Kiểm tra bảng giá có tồn tại không
            var priceList = await _context.PriceLists
                .FirstOrDefaultAsync(pl => pl.PriceListId == id);
            if (priceList == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy bảng giá"
                });
            }

            var products = await _context.PriceListDetails
                .Where(pld => pld.PriceListId == id)
                .ToListAsync();
           
            if (products.Any())
            {
                _context.PriceListDetails.RemoveRange(products);
            }

            var priceListCustomerRanks = await _context.PriceListCustomerRanks
                .Where(plcr => plcr.PriceListId == id)
                .ToListAsync();
            if (priceListCustomerRanks.Any())
            {
                _context.PriceListCustomerRanks.RemoveRange(priceListCustomerRanks);
            }
            // Xóa bảng giá
            _context.PriceLists.Remove(priceList);

            // Lưu thay đổi vào cơ sở dữ liệu
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Xóa bảng giá và tất cả sản phẩm liên quan thành công"
            });
        }

        [HttpPost("RemoveAllProducts")]
        public async Task<IActionResult> RemoveAllProducts([FromBody] RemoveAllProductsRequest request)
        {
            // Kiểm tra bảng giá có tồn tại không
            var priceList = await _context.PriceLists
                .FirstOrDefaultAsync(pl => pl.PriceListId == request.PriceListId && !pl.IsDeleted);
            if (priceList == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy bảng giá"
                });
            }

            // Lấy danh sách các sản phẩm cần xóa
            var productsToRemove = await _context.PriceListDetails
                .Where(pld => pld.PriceListId == request.PriceListId && request.ListId.Contains(pld.ProductId))
                .ToListAsync();

            if (!productsToRemove.Any())
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy sản phẩm nào để xóa"
                });
            }

            // Xóa các sản phẩm khỏi bảng giá
            _context.PriceListDetails.RemoveRange(productsToRemove);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Xóa tất cả sản phẩm khỏi bảng giá thành công"
            });
        }
        public class RemoveAllProductsRequest
        {
            public int PriceListId { get; set; }
            public List<int> ListId { get; set; } = new List<int>();
        }

        public class RemoveProductRequest
        {
            public int PriceListId { get; set; }
            public int ProductId { get; set; }
        }
        [HttpPost("RemoveProduct")]
        public async Task<IActionResult> RemoveProduct([FromBody] RemoveProductRequest request)
        {
            // Kiểm tra bảng giá có tồn tại không
            var priceList = await _context.PriceLists
                .FirstOrDefaultAsync(pl => pl.PriceListId == request.PriceListId && !pl.IsDeleted);
            if (priceList == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy bảng giá"
                });
            }

            // Lấy sản phẩm cần xóa
            var productToRemove = await _context.PriceListDetails
                .FirstOrDefaultAsync(pld => pld.PriceListId == request.PriceListId && pld.ProductId == request.ProductId);

            if (productToRemove == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Không tìm thấy sản phẩm để xóa"
                });
            }

            // Xóa sản phẩm khỏi bảng giá
            _context.PriceListDetails.Remove(productToRemove);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Xóa sản phẩm khỏi bảng giá thành công"
            });
        }
    }
}
