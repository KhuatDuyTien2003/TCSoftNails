using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using NailsTcsoft3.Data;
using NailsTcsoft3.Models;
using NailsTcsoft3.Models.Enum;
using NailsTcsoft3.repository;
using System.Data;
using System.Dynamic;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class BillController : ControllerBase
    {
        private readonly ThuctapKtktcnNail2025Context _context;

        public BillController(ThuctapKtktcnNail2025Context context)
        {
            _context = context;

        }
        [HttpGet]
            public async Task<IActionResult> GetAll()
            {
                var bills = await _context.Database
                                          .SqlQueryRaw<BillModel>("EXEC PROC_GET_ALL_BILL")
                                          .ToListAsync();

                if (bills == null || bills.Count == 0)
                {
                    return NotFound(new ResponseModel<List<BillModel>>
                    {
                        success = false,
                        message = "Không tìm thấy hóa đơn",
                        data = null
                    });
                }

                var billList = new List<BillSendModel>();
                foreach(var item in bills){
                    var bill = billList.Find(b => b.billId == item.billId);
                    if(bill == null)
                    {
                        var billSendModel = new BillSendModel
                        {
                            billId = item.billId,
                            billDate = item.billDate,
                            customerId = item.customerId,
                            customerName = item.customerName,
                            numberPhone = item.numberPhone,
                            moneyPoint = item.moneyPoint,
                            value_data = item.value_data,
                            totalBill = item.totalBill,
                            receptionId = item.receptionId,
                            receptionName = item.receptionName,
                            isPay = item.isPay,
                            statusBill = item.StatusBill,
                            BillSendDetails = new List<BillSendDetail>()
                            {
                                new BillSendDetail{
                                proAndSerName = item.proAndSerName,
                                quantity = item.quantity,
                                unitPrice = item.unitPrice,
                                totalMoney = item.totalMoney,
                                serviceStaffId = item.serviceStaffId,
                                serviceStaffName = item.serviceStaffName,
                                proAndSerId = item.proAndSerId
                            }
                            }
                        };
                        billList.Add(billSendModel);
                    }
                    else
                    {
                        var newBillDetail = new BillSendDetail
                        {
                            proAndSerName = item.proAndSerName,
                            quantity = item.quantity,
                            unitPrice = item.unitPrice,
                            totalMoney = item.totalMoney,
                            serviceStaffId = item.serviceStaffId,
                            serviceStaffName = item.serviceStaffName,
                            proAndSerId = item.proAndSerId
                        };
                        bill.BillSendDetails.Add(newBillDetail);
                    }
                }

                return Ok(new ResponseModel<List<BillSendModel>>
                {
                    success = true,
                    message = "Lấy danh sách hóa đơn thành công",
                    data = billList
                });
            }

        public class ProductModel
        {
            public int Id { get; set; }
            public string? Name { get; set; }
            public decimal? Price { get; set; }
            public int? UnitStock { get; set; }
            public int? WorkTime { get; set; }
            public string? UrlImage { get; set; }
            public int? Type { get; set; }

        }

        [HttpGet("GetProduct/{type}")]
        public  async Task<IActionResult> GetProduct(int type)
        {
            var model = int.Parse(type.ToString());
            var product = await _context.ProductAndServices.Where(p => p.ProAndSerType == model && p.IsDeleted == false)
                .Select(p => new ProductModel
                {
                    Id = p.ProAndSerId,
                    Name = p.ProAndSerName,
                    Price = p.SellingPrice,
                    UnitStock = p.InventoryQuantity ?? 0,
                    UrlImage = p.UrlImage,
                    WorkTime =  p.WorkTime ?? 0,
                    Type = p.ProAndSerType
                })
                .ToListAsync();

            if (product == null || product.Count == 0)
            {
                return NotFound(new ResponseModel<List<ProductModel>>
                {
                    success = false,
                    message = "Không tìm thấy sản phẩm",
                    data = null
                });
            }

            return Ok(new ResponseModel<List<ProductModel>>
            {
                success = true,
                message = "Lấy danh sách sản phẩm thành công",
                data = product
            });
        }
        [HttpGet("SearchProduct/{name}")]
        public  async Task<IActionResult> SearchProduct(string name)
        {
          
            var product = await _context.ProductAndServices.Where(p => p.ProAndSerName.Contains(name) && p.IsDeleted == false)
                .Select(p => new ProductModel
                {
                    Id = p.ProAndSerId,
                    Name = p.ProAndSerName,
                    Price = p.SellingPrice,
                    UnitStock = p.InventoryQuantity ?? 0,
                    UrlImage = p.UrlImage,
                    WorkTime =  p.WorkTime ?? 0,
                    Type = p.ProAndSerType
                })
                .ToListAsync();

            if (product == null || product.Count == 0)
            {
                return NotFound(new ResponseModel<List<ProductModel>>
                {
                    success = false,
                    message = "Không tìm thấy sản phẩm",
                    data = null
                });
            }

            return Ok(new ResponseModel<List<ProductModel>>
            {
                success = true,
                message = "Lấy danh sách sản phẩm thành công",
                data = product
            });
        }


        [HttpGet("GetPriceListByIdCustomer/{id?}")]
        public async Task<IActionResult> GetPriceListByIdCustomer(int? id)
        {
            
                var result  = await _context.Database.SqlQueryRaw<PriceListRespone>("EXEC PROC_GET_PRICE_LIST_BY_ID_CUSTOMER", id)
                .ToListAsync();

            if (result == null || result.Count == 0)
            {
                return NotFound(new ResponseModel<List<PriceListModel>>
                {
                    success = false,
                    message = "Không tìm thấy bảng giá",
                    data = null
                });
            }

            else
            {
             var priceList = new List<PriceListModel>();
                foreach (var item in result)
                {
                    if(priceList.Any(p => p.PriceListId == item.PriceListId))
                    {
                        var priceListItem = priceList.FirstOrDefault(p => p.PriceListId == item.PriceListId);
                        if (priceListItem != null)
                        {
                            priceListItem.PriceListDetails.Add(new PriceListDetailModel
                            {
                                ProductId = item.ProductId,
                                SellPrice = item.SellPrice
                            });
                        }
                    }
                    else
                    {
                          priceList.Add(new PriceListModel
                    {
                        PriceListId = item.PriceListId ,
                        PriceListName = item.PriceListName,
                        PriceListDetails = new List<PriceListDetailModel>()
                        {
                            new PriceListDetailModel
                            {
                                ProductId = item.ProductId,
                                SellPrice = item.SellPrice
                            }
                        }
                    });
                    }
                  
                }

            return Ok(new ResponseModel<List<PriceListModel>>
            {
                success = true,
                message = "Lấy danh sách bảng giá thành công",
                data = priceList
            });
            }
           
        }

        [HttpGet("GetPromotionByCode/{code}")]
        public async Task<IActionResult> GetPromotionByCode(string code)
        {
            var result = await _context.Database
                .SqlQueryRaw<PromotionModel>($"EXEC PROC_GET_PROMOTION_BY_CODE @CODE = {code}")
                .ToListAsync();
            if (result == null || result.Count == 0)
            {
                return NotFound(new ResponseModel<List<PromotionModel>>
                {
                    success = false,
                    message = "Không tìm thấy mã khuyến mãi",
                    data = null
                });
            }
            var promotionList = new List<PromotionModel>();
            foreach (var item in result)
            {
                var promotion = new PromotionModel
                {
                    PromotionId = item.PromotionId,
                    PromotionName = item.PromotionName,
                    PromotionType = item.PromotionType,
                    Quantity = item.Quantity,
                    ProductTypeId = item.ProductTypeId,
                    IsPoints = item.IsPoints,
                    Condition = item.Condition,
                    RankId = item.RankId,
                    UrlImage = item.UrlImage,
                    Value_data = item.Value_data
                };
                promotionList.Add(promotion);
            }
            return Ok(new ResponseModel<List<PromotionModel>>
            {
                success = true,
                message = "Lấy danh sách khuyến mãi thành công",
                data = promotionList
            });
        }

        [HttpPost("CreateBill")]

        public async Task<IActionResult> CreateBill([FromBody] BillResponseModel model)
        {
            if (model == null)
            {
                return BadRequest(new ResponseModel<BillResponseModel>
                {
                    success = false,
                    message = "Dữ liệu không hợp lệ",
                    data = null
                });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new ResponseModel<BillResponseModel>
                {
                    success = false,
                    message = "Model không hợp lệ",
                    data = null
                });
            }

            if (model.BillDetails == null || !model.BillDetails.Any())
            {
                return BadRequest(new ResponseModel<BillResponseModel>
                {
                    success = false,
                    message = "Danh sách chi tiết hóa đơn không được để trống",
                    data = null
                });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var newBill = new Bill
                {
                    TotalMoney = model.TotalMoney,  // Nếu TotalMoney có thể null, gán 0 nếu null
                    ReceptionistId = model.ReceptionistId, // Nếu ReceptionistId có thể null, gán 0 nếu null
                    CustomerId = model.CustomerId,  // Nếu CustomerId có thể null, gán 0 nếu null
                    Points = model.Points,          // Có thể null, không gán giá trị mặc định
                    BillDate = DateTime.Now,
                    TotalMoneyAfterDiscount = model.TotalMoneyAfterDiscount, // Nếu có thể null, gán 0 nếu null
                    StatusBill = model.StatusBill.HasValue
                        ? (BillStatus)model.StatusBill.Value
                        : BillStatus.ChuaThanhToan,  // Nếu StatusBill là nullable, gán giá trị mặc định là Pending

                    MoneyPoint = model.MoneyPoint ?? 0,      // Nếu MoneyPoint có thể null, gán 0 nếu null
                    TotalDiscount = model.TotalDiscount ?? 0, // Nếu TotalDiscount có thể null, gán 0 nếu null
                    PromotionId = model.PromotionId, // Nếu PromotionId có thể null, giữ nguyên giá trị null
                    PaymentId = model.PaymentId,     // Giữ nguyên nếu là bool và không nullable
                    IsPay = model.IsPay,            // Giữ nguyên nếu là bool và không nullable
                    IsDeleted = false,
                    Status = true,
                };

                _context.Bills.Add(newBill);
                await _context.SaveChangesAsync(); // Để lấy newBill.BillId

                var billDetails = model.BillDetails.Select(detail => new BillDetail
                {
                    BillId = newBill.BillId,
                    ProAndSerId = detail.ProAndSerId, // Nếu ProAndSerId có thể null, gán 0 nếu null
                    Quantity = detail.Quantity ?? 1,       // Nếu Quantity có thể null, gán 1 nếu null
                    UnitPrice = detail.UnitPrice,     // Nếu UnitPrice có thể null, gán 0 nếu null
                    StaffId = detail.StaffId ?? 0,         // Nếu StaffId có thể null, gán 0 nếu null
                    TotalMoney = detail.TotalMoney,   // Nếu TotalMoney có thể null, gán 0 nếu null
                    IsDeleted = false,
                    Status = true
                }).ToList();

                _context.BillDetails.AddRange(billDetails);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new ResponseModel<object>
                {
                    success = true,
                    message = "Tạo hóa đơn thành công",
                    data = new
                    {
                        BillId = newBill.BillId,
                        model.TotalMoney,
                        model.TotalMoneyAfterDiscount,
                        model.BillDetails
                    }
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new ResponseModel<BillResponseModel>
                {
                    success = false,
                    message = "Tạo hóa đơn thất bại: " + (ex.InnerException?.Message ?? ex.Message),
                    data = null
                });
            }
        }

        public class SearchBillRequest
        {
            public int? BillId { get; set; }
            public string? CustomerName { get; set; }
            public string? ProductName { get; set; }
            public string? Receiption { get; set; }
            public List<int>? StatusBill { get; set; }
            public List<int>? Payment { get; set; }
            public DateTime? FromDate { get; set; }
            public DateTime? ToDate { get; set; }
        }

        [HttpPost("FilterBill")]
        private DataTable ToIntListDataTable(List<int> list)
        {
            var table = new DataTable();
            table.Columns.Add("Value", typeof(int));
            if (list != null)
            {
                foreach (var item in list)
                {
                    table.Rows.Add(item);
                }
            }
            return table;
        }
        [HttpPost("FilterBill")]
        public async Task<IActionResult> FilterBill( SearchBillRequest model)
        {
            var result = new List<BillModel>();

            using (var connection = _context.Database.GetDbConnection())
            {
                await connection.OpenAsync();

                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "PROC_SEARCH_BILL";
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.Add(new SqlParameter("@BILLID", model.BillId ?? (object)DBNull.Value));
                    command.Parameters.Add(new SqlParameter("@CUSTOMERNAME", model.CustomerName ?? (object)DBNull.Value));
                    command.Parameters.Add(new SqlParameter("@PRODUCTNAME", model.ProductName ?? (object)DBNull.Value));
                    command.Parameters.Add(new SqlParameter("@RECEPTION", model.Receiption ?? (object)DBNull.Value));
                    command.Parameters.Add(new SqlParameter("@FROMDATE", model.FromDate ?? (object)DBNull.Value));
                    command.Parameters.Add(new SqlParameter("@TODATE", model.ToDate ?? (object)DBNull.Value));

                    var statusBillParam = new SqlParameter("@STATUSBILL", SqlDbType.Structured)
                    {
                        TypeName = "IntList",
                        Value = ToIntListDataTable(model.StatusBill)
                    };
                    var paymentParam = new SqlParameter("@PAYMENT", SqlDbType.Structured)
                    {
                        TypeName = "IntList",
                        Value = ToIntListDataTable(model.Payment)
                    };

                    command.Parameters.Add(statusBillParam);
                    command.Parameters.Add(paymentParam);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            int statusBillOrdinal = reader.GetOrdinal("StatusBill");

                            result.Add(new BillModel
                            {
                                billDate = reader.IsDBNull(reader.GetOrdinal("billDate")) ? DateTime.MinValue : reader.GetDateTime(reader.GetOrdinal("billDate")),
                                billId = reader.IsDBNull(reader.GetOrdinal("billId")) ? 0 : reader.GetInt32(reader.GetOrdinal("billId")),
                                customerId = reader.IsDBNull(reader.GetOrdinal("customerId")) ? 0 : reader.GetInt32(reader.GetOrdinal("customerId")),
                                proAndSerId = reader.IsDBNull(reader.GetOrdinal("proAndSerId")) ? 0 : reader.GetInt32(reader.GetOrdinal("proAndSerId")),
                                customerName = reader.IsDBNull(reader.GetOrdinal("customerName")) ? string.Empty : reader.GetString(reader.GetOrdinal("customerName")),
                                numberPhone = reader.IsDBNull(reader.GetOrdinal("numberPhone")) ? string.Empty : reader.GetString(reader.GetOrdinal("numberPhone")),
                                moneyPoint = reader.IsDBNull(reader.GetOrdinal("moneyPoint")) ? 0 : reader.GetDecimal(reader.GetOrdinal("moneyPoint")),
                                value_data = reader.IsDBNull(reader.GetOrdinal("value_data")) ? 0 : reader.GetDouble(reader.GetOrdinal("value_data")),
                                proAndSerName = reader.IsDBNull(reader.GetOrdinal("proAndSerName")) ? string.Empty : reader.GetString(reader.GetOrdinal("proAndSerName")),
                                quantity = reader.IsDBNull(reader.GetOrdinal("quantity")) ? 0 : reader.GetInt32(reader.GetOrdinal("quantity")),
                                unitPrice = reader.IsDBNull(reader.GetOrdinal("unitPrice")) ? 0 : reader.GetDecimal(reader.GetOrdinal("unitPrice")),
                                totalMoney = reader.IsDBNull(reader.GetOrdinal("totalMoney")) ? 0 : reader.GetDecimal(reader.GetOrdinal("totalMoney")),
                                totalBill = reader.IsDBNull(reader.GetOrdinal("totalBill")) ? 0 : reader.GetDecimal(reader.GetOrdinal("totalBill")),
                                serviceStaffId = reader.IsDBNull(reader.GetOrdinal("serviceStaffId")) ? 0 : reader.GetInt32(reader.GetOrdinal("serviceStaffId")),
                                serviceStaffName = reader.IsDBNull(reader.GetOrdinal("serviceStaffName")) ? string.Empty : reader.GetString(reader.GetOrdinal("serviceStaffName")),
                                receptionId = reader.IsDBNull(reader.GetOrdinal("receptionId")) ? 0 : reader.GetInt32(reader.GetOrdinal("receptionId")),
                                receptionName = reader.IsDBNull(reader.GetOrdinal("receptionName")) ? string.Empty : reader.GetString(reader.GetOrdinal("receptionName")),
                                isPay = !reader.IsDBNull(reader.GetOrdinal("isPay")) && reader.GetBoolean(reader.GetOrdinal("isPay")),
                                StatusBill = reader.IsDBNull(statusBillOrdinal)
                                                ? (BillStatus?)0
                                                : (BillStatus?)reader.GetInt32(statusBillOrdinal)
                            });
                        }
                    }
                }
            }

            if (result == null || result.Count == 0)
            {
                return NotFound(new ResponseModel<List<BillSendModel>>
                {
                    success = false,
                    message = "Không tìm thấy hóa đơn",
                    data = null
                });
            }

            var billList = result
                .GroupBy(b => b.billId)
                .Select(group => new BillSendModel
                {
                    billId = group.Key,
                    billDate = group.First().billDate,
                    customerId = group.First().customerId,
                    customerName = group.First().customerName,
                    numberPhone = group.First().numberPhone,
                    moneyPoint = group.First().moneyPoint,
                    value_data = group.First().value_data,
                    totalBill = group.First().totalBill,
                    receptionId = group.First().receptionId,
                    receptionName = group.First().receptionName,
                    isPay = group.First().isPay,
                    statusBill = group.First().StatusBill,
                    BillSendDetails = group.Select(detail => new BillSendDetail
                    {
                        proAndSerName = detail.proAndSerName,
                        quantity = detail.quantity,
                        unitPrice = detail.unitPrice,
                        totalMoney = detail.totalMoney,
                        serviceStaffId = detail.serviceStaffId,
                        serviceStaffName = detail.serviceStaffName,
                        proAndSerId = detail.proAndSerId
                    }).ToList()
                })
                .ToList();

            return Ok(new ResponseModel<List<BillSendModel>>
            {
                success = true,
                message = "Lấy danh sách hóa đơn thành công",
                data = billList
            });
        }

        [HttpGet("DeleteBill/{id}")]
        public async Task<IActionResult> DeleteBill(int id)
        {
            var bill = await _context.Bills.FirstOrDefaultAsync(b => b.BillId == id);
            if (bill == null)
            {
                return NotFound(new ResponseModel<Bill>
                {
                    success = false,
                    message = "Không tìm thấy hóa đơn",
                    data = null
                });
            }
            bill.IsDeleted = true;
            _context.SaveChanges();
            return Ok(new ResponseModel<Bill>
            {
                success = true,
                message = "Xóa hóa đơn thành công",
                data = bill
            });
        }
    }
}
