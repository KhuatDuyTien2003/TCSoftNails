using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NailsTcsoft3.Data;
using Microsoft.EntityFrameworkCore;
using NailsTcsoft3.Models;
using System.Text.Json;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class GoodsReceiptsController : ControllerBase
    {
        private readonly ThuctapKtktcnNail2025Context _context;

        public GoodsReceiptsController(ThuctapKtktcnNail2025Context context)
        {
            _context = context;
        }

        [HttpGet("GetAll")]
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
        public async Task<IActionResult> GetByFilter([FromQuery] GoodsReceiptFilter filter)
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
        public async Task<IActionResult> CreateGoodsReceipt([FromBody] GoodsReceiptForm request)
        {
            if (request == null)
            {
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });
            }

            var receipt = new GoodsReceipt
            {
                ImportDate = DateTime.Now,
                TotalMoney = request.TotalMoney,
                ReceiptCode = request.ReceiptCode,
                SupplierId = request.SupplierId,
                Comment = request.Comment,
                AccountantId = request.AccountantId,
                PaymentMethod = request.PaymentMethod,
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

            if (request.SelectedProducts != null)
            {
                var selectedProducts = JsonSerializer.Deserialize<List<GoodsReceiptDetailForm>>(request.SelectedProducts);
                foreach (var product in selectedProducts)
                {
                    var detail = new GoodsReceiptDetail
                    {
                        ReceiptId = receipt.ReceiptId,
                        ProductId = product.ProductId,
                        Quantity = product.Quantity,
                        ImportPrice = product.ImportPrice,
                        IsDeleted = false,
                        Status = product.Status
                    };
                    await _context.GoodsReceiptDetails.AddAsync(detail);
                    receipt.TotalQuantity += product.Quantity;
                    receipt.TotalProduct++;

                }
                await _context.SaveChangesAsync();
            }
            return CreatedAtAction(nameof(GetGoodsReceiptById), new { id = receipt.ReceiptId }, new
            {
                success = true,
                message = "Tạo phiếu nhập hàng thành công.",
                data = receipt
            });
        }

        [HttpPut("Update/{id}")]
        public async Task<IActionResult> UpdateGoodsReceipt(int id, [FromBody] GoodsReceipt request)
        {
            var goodsReceipt = await _context.GoodsReceipts
                .FirstOrDefaultAsync(gr => gr.ReceiptId == id && !gr.IsDeleted);

            if (goodsReceipt == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy phiếu nhập hàng." });
            }
            goodsReceipt.Comment = request.Comment;
            goodsReceipt.AccountantId = request.AccountantId;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Cập nhật phiếu nhập hàng thành công." });
        }


        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> DeleteGoodsReceipt(int id)
        {
            var goodsReceipt = await _context.GoodsReceipts
                .FirstOrDefaultAsync(gr => gr.ReceiptId == id);

            if (goodsReceipt == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy phiếu nhập hàng." });
            }

            goodsReceipt.Status = 2;

            await _context.SaveChangesAsync();

            if (goodsReceipt.Status == 2)
            {
                var result = await DecreaseQuantity(id);
                if (!result)
                {
                    return BadRequest(new { success = false, message = "Hủy nhập hàng không thành công." });
                }
            }

            return Ok(new { success = true, message = "Hủy nhập hàng thành công." });
        }

        [NonAction]
        public async Task<bool> DecreaseQuantity(int receiptId)

        {
            var details = await _context.GoodsReceiptDetails
                .Where(grd => grd.ReceiptId == receiptId)
                .ToListAsync();

            if (details == null || !details.Any())
            {
                return false;
            }

            foreach (var item in details)
            {
                var product = await _context.ProductAndServices
                    .FirstOrDefaultAsync(p => p.ProAndSerId == item.ProductId);
                if (product != null)
                {
                    product.InventoryQuantity -= item.Quantity;
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

    }
}
