using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NailsTcsoft3.Data;
using Microsoft.EntityFrameworkCore;
using NailsTcsoft3.Models;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using NailsTcsoft3.Middleware;
using NailsTcsoft3.Models.Enum;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class GoodsReceiptsController : ControllerBase
    {
        private readonly ThuctapKtktcnNail2025Context _context;

        public GoodsReceiptsController(ThuctapKtktcnNail2025Context context)
        {
            _context = context;
        }

        [HttpGet("GetAll")]
        
        [ClaimRequirement(PermissionAction.GOODSRECEIPT_VIEW)]
        public async Task<IActionResult> GetAllGoodsReceipts()
        {
            var goodsReceipts = await _context.GoodsReceipts
                .Where(gr => !gr.IsDeleted)
                .ToListAsync();
            if (goodsReceipts.Count == 0)
            {
                return NotFound(new { success = false, message = "Phiếu hàng trống." });
            }

            return Ok(new
            {
                success = true,
                message = "Lấy danh sách phiếu nhập hàng thành công",
                data = goodsReceipts
            });
        }

        [HttpGet("GetByFilter")]
        [ClaimRequirement(PermissionAction.GOODSRECEIPT_SEARCH)]
        public async Task<IActionResult> GetByFilter([FromQuery] ReceiptFilter filter)
        {
            var query = _context.GoodsReceipts
                .Where(gr => !gr.IsDeleted)
                .AsQueryable();

            if (filter.TimeStart.HasValue && filter.TimeEnd.HasValue)
            {
                query = query.Where(gr => gr.ImportDate >= filter.TimeStart.Value && gr.ImportDate <= filter.TimeEnd.Value);
            }
            else if (filter.Days.HasValue)
            {
                var startDate = DateTime.Today.AddDays(-filter.Days.Value);
                query = query.Where(gr => gr.ImportDate.Date >= startDate);
            }
            if (filter.TimeStart.HasValue && !filter.TimeEnd.HasValue)
            {
                query = query.OrderBy(gr => gr.ImportDate.Date);
            }
            else
            {
                query = query.OrderByDescending(gr => gr.ImportDate.Date);
            }


            if (!string.IsNullOrEmpty(filter.ReceiptCode))
            {
                query = query.Where(gr => gr.ReceiptCode.Contains(filter.ReceiptCode));
            }

            if (!string.IsNullOrEmpty(filter.SupplierName))
            {
                var supplierIds = await _context.Suppliers
                    .Where(s => s.SupplierName.Contains(filter.SupplierName))
                    .Select(s => s.SupplierId)
                    .ToListAsync();
                query = query.Where(gr => supplierIds.Contains(gr.SupplierId));
            }

            if (!string.IsNullOrEmpty(filter.AccountantName))
            {
                var accountantIds = await _context.Staff
                    .Where(a => a.StaffName.Contains(filter.AccountantName))
                    .Select(a => a.StaffId)
                    .ToListAsync();
                query = query.Where(gr => accountantIds.Contains(gr.AccountantId ?? 0));
            }

            if (!string.IsNullOrEmpty(filter.ProductName))
            {
                var receiptIds = await _context.GoodsReceiptDetails
                    .Where(d => _context.ProductAndServices
                        .Any(p => p.ProAndSerId == d.ProductId && p.ProAndSerName.Contains(filter.ProductName)))
                    .Select(d => d.ReceiptId)
                    .Distinct()
                    .ToListAsync();
                query = query.Where(gr => receiptIds.Contains(gr.ReceiptId));
            }

            if (filter.Status != null && filter.Status.Any())
            {
                query = query.Where(gr => filter.Status.Contains(gr.Status));
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)filter.PageSize);

            var data = await query
                .OrderByDescending(gr => gr.ImportDate)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            if (!data.Any())
            {
                return Ok(new
                {
                    success = false,
                    message = "Không có phiếu nào được tìm thấy.",
                    data = new List<GoodsReceipt>(),
                    totalItems = 0,
                    totalPages = 0,
                    currentPage = filter.PageNumber
                });
            }

            return Ok(new
            {
                success = true,
                message = "Lấy danh sách phiếu nhập hàng thành công",
                data,
                totalItems,
                totalPages,
                currentPage = filter.PageNumber
            });
        }



        [HttpGet("{id}")]

        public async Task<IActionResult> GetGoodsReceiptById(int id)
        {
            var goodsReceipt = await (from gr in _context.GoodsReceipts
                                      join grd in _context.GoodsReceiptDetails on gr.ReceiptId equals grd.ReceiptId
                                      where gr.ReceiptId == id && !gr.IsDeleted
                                      select new
                                      {
                                          gr.ReceiptId,
                                          gr.IsDeleted,
                                          GoodsReceiptDetails = grd
                                      })
                                      .FirstOrDefaultAsync();

            if (goodsReceipt == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy phiếu nhập hàng." });
            }

            return Ok(goodsReceipt);
        }

        [HttpPost("Create")]
        [ClaimRequirement(PermissionAction.GOODSRECEIPT_ADD)]

        public async Task<IActionResult> CreateGoodsReceipt([FromForm] ReceiptForm request)
        {
            if (request == null)
            {
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });
            }

            // Kiểm tra ReceiptCode đã tồn tại chưa
            if (!string.IsNullOrWhiteSpace(request.ReceiptCode))
            {
                var existingCode = await _context.GoodsReceipts
                    .AnyAsync(r => r.ReceiptCode == request.ReceiptCode && !r.IsDeleted);

                if (existingCode)
                {
                    return Conflict(new
                    {
                        success = false,
                        message = $"Mã phiếu '{request.ReceiptCode}' đã tồn tại."
                    });
                }
            }

            var receipt = new GoodsReceipt
            {
                ImportDate = request.ImportDate,
                TotalMoney = request.TotalMoney,
                PaymentMoney = request.PaymentMoney,
                ReceiptCode = request.ReceiptCode,
                TotalQuantity= request.TotalQuantity,
                Due = request.Due,
                SupplierId = request.SupplierId,
                Comment = request.Comment,
                AccountantId = request.AccountantId,
                IsDeleted = false,
                Status = request.Status
            };

            await _context.GoodsReceipts.AddAsync(receipt);
            await _context.SaveChangesAsync();
            if (receipt.ReceiptCode == null)
            {
                receipt.ReceiptCode = "PN" + receipt.ReceiptId.ToString("D4");
                await _context.SaveChangesAsync();
            }
           
            if (!request.SelectedProducts.IsNullOrEmpty())
            {
             var selectedProducts = JsonSerializer.Deserialize<List<GoodsReceiptDetailForm>>(request.SelectedProducts, new JsonSerializerOptions { PropertyNameCaseInsensitive = true } );
                foreach (var product in selectedProducts)
                {
                    var detail = new GoodsReceiptDetail
                    {
                        ReceiptId = receipt.ReceiptId,
                        ProductId = product.ProductId,
                        Quantity = product.Quantity,
                        ImportPrice = product.ImportPrice,
                        IsDeleted = false,
                        Status = true
                    };
                    await _context.GoodsReceiptDetails.AddAsync(detail);
                    receipt.TotalQuantity += product.Quantity;
                    receipt.TotalProduct++;

                    if (receipt.Status == 1)
                    {
                        var productInDb = await _context.ProductAndServices
                            .FirstOrDefaultAsync(p => p.ProAndSerId == product.ProductId);
                        if (productInDb != null)
                        {
                            productInDb.InventoryQuantity += product.Quantity;
                        }
                    }

                }
                await _context.SaveChangesAsync();
            }
            return Ok(new
            {
                success = true,
                message = "Tạo phiếu nhập hàng thành công.",
                data = receipt,
            });
        }
        [HttpGet("GetDetailReceipt/{id}")]
        public async Task<IActionResult> GetDetailReceipt(int id)
        {
            // Lấy phiếu nhập hàng
            var receipt = await _context.GoodsReceipts
                .Where(gr => gr.ReceiptId == id && !gr.IsDeleted)
                .Select(gr => new
                {
                    gr.ReceiptId,
                    gr.ReceiptCode,
                    gr.ImportDate,
                    gr.TotalMoney,
                    gr.PaymentMoney,
                    gr.Due,
                    gr.TotalQuantity,
                    gr.TotalProduct,
                    gr.SupplierId,
                    gr.Comment,
                    gr.AccountantId,
                    gr.Status
                })
                .FirstOrDefaultAsync();

            if (receipt == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy phiếu nhập hàng." });
            }

            // Lấy chi tiết sản phẩm của phiếu nhập hàng
            var details = await _context.GoodsReceiptDetails
                .Where(d => d.ReceiptId == id && !d.IsDeleted)
                .Select(d => new
                {
                    d.Id,
                    d.ProductId,
                    d.Quantity,
                    d.ImportPrice,
                    d.Status
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                message = "Lấy chi tiết phiếu nhập hàng thành công.",
                data = new
                {
                    receipt,
                    details
                }
            });
        }


        [HttpPut("Update/{id}")]
        [ClaimRequirement(PermissionAction.GOODSRECEIPT_EDIT)]

        public async Task<IActionResult> UpdateGoodsReceipt(int id, [FromForm] GoodsReceipt request)
        {
            if (request == null)
            {
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });
            }
            var goodsReceipt = await _context.GoodsReceipts
                .FirstOrDefaultAsync(gr => gr.ReceiptId == id && !gr.IsDeleted);

            if (goodsReceipt == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy phiếu nhập hàng." });
            }
            goodsReceipt.Comment = request.Comment;
            goodsReceipt.AccountantId = request.AccountantId;
            goodsReceipt.LastUpdate = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Cập nhật phiếu nhập hàng thành công." });
        }


        [HttpPut("UpdateReceiptDetail/{id}")]
        public async Task<IActionResult> UpdateGoodsReceiptDetail(int id, [FromForm] ReceiptForm request)
        {
            if (request == null || request.SelectedProducts.IsNullOrEmpty())
            {
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });
            }


            var goodsReceipt = await _context.GoodsReceipts
                .FirstOrDefaultAsync(gr => gr.ReceiptId == id && !gr.IsDeleted);
            if (goodsReceipt == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy phiếu nhập hàng." });
            }
            if (goodsReceipt.Status == 1)
            {
                return BadRequest(new { success = false, message = "Không sửa chi tiết sản phẩm phiếu đã nhập thành công." });
            }

            // Cập nhật thông tin phiếu nhập
            goodsReceipt.Comment = request.Comment;
            goodsReceipt.AccountantId = request.AccountantId;
            goodsReceipt.TotalMoney = request.TotalMoney;
            goodsReceipt.TotalQuantity = request.TotalQuantity;
            goodsReceipt.Due = request.Due;
            goodsReceipt.PaymentMoney = request.PaymentMoney;
            goodsReceipt.Status = request.Status;
            goodsReceipt.ImportDate = request.ImportDate;
            goodsReceipt.LastUpdate = DateTime.Now;

            // Xóa tất cả chi tiết cũ
            var oldDetails = _context.GoodsReceiptDetails
                .Where(d => d.ReceiptId == id);
            _context.GoodsReceiptDetails.RemoveRange(oldDetails);

            // Thêm mới danh sách chi tiết từ request
            if (!request.SelectedProducts.IsNullOrEmpty())
            {
                var selectedProducts = JsonSerializer.Deserialize<List<GoodsReceiptDetailForm>>(request.SelectedProducts, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                foreach (var product in selectedProducts)
                {
                    var newDetail = new GoodsReceiptDetail
                    {
                        ReceiptId = id,
                        ProductId = product.ProductId,
                        Quantity = product.Quantity,
                        ImportPrice = product.ImportPrice,
                        IsDeleted = false,
                        Status = true
                    };
                    await _context.GoodsReceiptDetails.AddAsync(newDetail);

                    if (request.Status == 1)
                    {
                        var productInDb = await _context.ProductAndServices
                            .FirstOrDefaultAsync(p => p.ProAndSerId == product.ProductId);
                        if (productInDb != null)
                        {
                            productInDb.InventoryQuantity += product.Quantity;
                        }
                    }
                }
            }
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Cập nhật chi tiết phiếu nhập hàng thành công." });
        }

        [HttpGet("GetAllStaff")]
        public async Task<IActionResult> GetAllStaff()
        {
            var staffList = await _context.Staff
                .Where(s => !s.IsDeleted)
                .Select(s => new
                {
                    s.StaffId,
                    s.StaffName,
                })
                .ToListAsync();

            if (!staffList.Any())
            {
                return Ok(new
                {
                    success = false,
                    message = "Không có nhân viên nào."
                });
            }

            return Ok(new
            {
                success = true,
                message = "Lấy danh sách nhân viên thành công.",
                data = staffList
            });
        }
        [ClaimRequirement(PermissionAction.GOODSRECEIPT_DELETE)]

        // Xóa mềm một phiếu nhập hàng và chi tiết phiếu
        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var receipt = await _context.GoodsReceipts.FirstOrDefaultAsync(r => r.ReceiptId == id && !r.IsDeleted);
            if (receipt == null)
                return NotFound(new { success = false, message = "Không tìm thấy phiếu nhập hàng." });

            receipt.IsDeleted = true;

            var details = await _context.GoodsReceiptDetails
                .Where(d => d.ReceiptId == id && !d.IsDeleted)
                .ToListAsync();

            foreach (var detail in details)
            {
                detail.IsDeleted = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Xóa phiếu nhập hàng và chi tiết thành công." });
        }
        [ClaimRequirement(PermissionAction.GOODSRECEIPT_DELETE)]


        [HttpDelete("DeleteAll")]
        public async Task<IActionResult> DeleteAll()
        {
            // Lấy tất cả phiếu nhập hàng chưa bị xóa
            var receipts = await _context.GoodsReceipts
                .Where(r => !r.IsDeleted)
                .ToListAsync();

            if (!receipts.Any())
                return NotFound(new { success = false, message = "Không có phiếu nhập hàng nào để xóa." });

            foreach (var receipt in receipts)
            {
                receipt.IsDeleted = true;
            }

            // Lấy tất cả chi tiết phiếu nhập hàng chưa bị xóa
            var details = await _context.GoodsReceiptDetails
                .Where(d => !d.IsDeleted)
                .ToListAsync();

            foreach (var detail in details)
            {
                detail.IsDeleted = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Đã xóa tất cả phiếu nhập hàng và chi tiết phiếu."
            });
        }


    }
}
