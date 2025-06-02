using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailsTcsoft3.Data;
using NailsTcsoft3.Middleware;
using NailsTcsoft3.Models;
using NailsTcsoft3.Models.Enum;
using NailsTcsoft3.repository;
using OfficeOpenXml;
using System.Linq;
using System.Numerics;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class CustomerController : ControllerBase
    {
        private readonly ThuctapKtktcnNail2025Context _context;
      
        private readonly ISaveImageRepo _saveImageRepo;
        public CustomerController(ThuctapKtktcnNail2025Context context, ISaveImageRepo saveImageRepo) {
            _context = context;
            _saveImageRepo = saveImageRepo;
        }
        [HttpGet]
        [ClaimRequirement(PermissionAction.CUSTOMER_VIEW)]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10) {
            var skip = (page - 1) * pageSize;
            var result =  _context.Customers.Where(c => c.Status == true && c.IsDeleted == false).Select(c => new CustomerSentModel
            {
                CustomerId = c.CustomerId,
                CustomerName = c.CustomerName,
                Birthday = DateTime.Parse( c.Birthday.ToString()),
                Email = c.Email,
                Gender = c.Gender.HasValue ? c.Gender.Value : false,
                NumberPhone = c.NumberPhone,
                Password = c.Password,
                RankId = c.RankId.GetValueOrDefault(),
                RankName = _context.CustomerRanks.Where(r => r.RankId == c.RankId.GetValueOrDefault()).Select(r => r.RankName).FirstOrDefault(),
                TotalMoney =decimal.Parse( c.TotalMoney.ToString()),
                TotalPoints = c.TotalPoints.GetValueOrDefault(),
                UrlAvatar = c.UrlAvatar,
                UserName = c.UserName
        }).Skip(skip).Take(pageSize);
            var totalCount = _context.Customers.Count(c=> c.IsDeleted == false);
            if (result.Any())
            {
                return Ok(new { data = result, count = totalCount });
               
            }
            else
            {
                return Ok(new
                {
                    success = false,
                    message = "Lấy toàn bộ khách hàng thất bại",

                });
            }
           
        }


        [HttpPost("SearchCustomer")]
        [ClaimRequirement(PermissionAction.CUSTOMER_SEARCH)]
        public async Task<IActionResult> SearchCustomer(SearchCustomerModel? keywordModel)
        {
            int skip = ((keywordModel.Page ?? 1) - 1) * (keywordModel.PageSize ?? 10);
            var result = _context.Customers.Where(c => (c.Status == true && c.IsDeleted == false) &&
                (string.IsNullOrEmpty(keywordModel.Keyword) || c.CustomerId.ToString().Contains(keywordModel.Keyword) ||
                 c.CustomerName.Contains(keywordModel.Keyword) ||
                 c.NumberPhone.Contains(keywordModel.Keyword)) &&
                (!keywordModel.FromDate.HasValue || !keywordModel.ToDate.HasValue ||
                 (c.Birthday.HasValue &&
                  c.Birthday.Value.Month >= keywordModel.FromDate.Value.Month &&
                  c.Birthday.Value.Day >= keywordModel.FromDate.Value.Day &&
                  c.Birthday.Value.Month <= keywordModel.ToDate.Value.Month &&
                  c.Birthday.Value.Day <= keywordModel.ToDate.Value.Day)) &&
                  (string.IsNullOrEmpty(keywordModel.RankId) || c.RankId.ToString() == keywordModel.RankId) &&
                 (!keywordModel.Gender.HasValue || c.Gender == keywordModel.Gender))
                .Select(c => new CustomerSentModel
                {
                    CustomerId = c.CustomerId,
                    CustomerName = c.CustomerName,
                    Birthday = DateTime.Parse(c.Birthday.ToString()),
                    Email = c.Email,
                    Gender = c.Gender.HasValue ? c.Gender.Value : false,
                    NumberPhone = c.NumberPhone,
                    Password = c.Password,
                    RankId = c.RankId.GetValueOrDefault(),
                    RankName = _context.CustomerRanks.Where(r => r.RankId == c.RankId.GetValueOrDefault()).Select(r => r.RankName).FirstOrDefault(),
                    TotalMoney = decimal.Parse(c.TotalMoney.ToString()),
                    TotalPoints = c.TotalPoints.GetValueOrDefault(),
                    UrlAvatar = c.UrlAvatar,
                    UserName = c.UserName
                });
            var countResult = result.Count();

            if (result.Any())
            {
                return Ok(new
                {
                    success = true,
                    data= result.Skip(skip).Take(int.Parse(keywordModel.PageSize.ToString())),
                    count = countResult
                });

            }
            else
            {
                return Ok(new ErrorModel
                {
                    success = false,
                    message = "Không tìm thấy khách hàng nào phù hợp",

                });
            }
        }
        [HttpPost("AddCustomer")]
        public async Task<IActionResult> AddCustomer(CustomerReceiveModel model)
        {
            if (model == null)
            {
                return BadRequest("Dữ liệu không hợp lệ!");
            }

            // Kiểm tra email có tồn tại không
            bool emailExists = await _context.Customers.AnyAsync(c => c.Email == model.Email);
            if (emailExists)
            {
                return Ok(new ErrorModel
                {
                    success = false,
                    message = "Email đã tồn tại trong hệ thống",
                });
            }

            // Kiểm tra số điện thoại có tồn tại không
            bool phoneExists = await _context.Customers.AnyAsync(c => c.NumberPhone == model.NumberPhone);
            if (phoneExists)
            {
                return Ok(new ErrorModel
                {
                    success = false,
                    message = "Số điện thoại đã tồn tại trong hệ thống",
                });
            }

            var imageRepspone = await _saveImageRepo.SaveImageAsync(model.UrlAvatar);
            if (!imageRepspone.success)
            {
                return Ok(new ErrorModel
                {
                    success = false,
                    message = imageRepspone.message,
                });
            }

            var newCustomer = new Customer
            {
                Email = model.Email,
                NumberPhone = model.NumberPhone,
                UserName = model.UserName,
                Password = model.Password,
                Birthday = model.Birthday,
                CustomerName = model.CustomerName,
                Gender = model.Gender,
                IsDeleted = false,
                TotalMoney = 0,
                TotalPoints = 0,
                RankId = 1,
                Status = true,
                UrlAvatar = imageRepspone.data
            };

            await _context.Customers.AddAsync(newCustomer);
            if (await _context.SaveChangesAsync() > 0)
            {
                return Ok(new ErrorModel { success = true, message = "Thêm khách hàng thành công" });
            }
            return StatusCode(500, "Lỗi kết nối database");
        }

        [HttpPost("EditCustomer")]
        [ClaimRequirement(PermissionAction.CUSTOMER_EDIT)]
        public async Task<IActionResult> EditCustomer(CustomerReceiveModel model)
        {
            if (model == null)
            {
                return BadRequest("Dữ liệu không hợp lệ!");
            }

            var customer = await _context.Customers.FindAsync(model.CustomerId);
            if (customer == null)
            {
                return BadRequest("Khách hàng này không tồn tại");
            }

            customer.Birthday = model.Birthday;
            customer.CustomerName = model.CustomerName;
            customer.Gender = model.Gender;
            customer.NumberPhone = model.NumberPhone;
            customer.Email = model.Email;

            if (!string.IsNullOrEmpty(model.UrlAvatar))
            {
                var imageResponse = await _saveImageRepo.SaveImageAsync(model.UrlAvatar);
                if (!imageResponse.success)
                {
                    return Ok(new ErrorModel
                    {
                        success = false,
                        message = imageResponse.message,
                    });
                }
                customer.UrlAvatar = imageResponse.data;
            }

            if (await _context.SaveChangesAsync() > 0)
            {
                return Ok(new ErrorModel { success = true, message = "Sửa khách hàng thành công"});
            }
            return StatusCode(500, "Lỗi kết nối database");
        }



        [HttpGet("{id}")]
        public async Task<IActionResult> GetCustomer(int id) {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.CustomerId == id);
            if(customer == null)
            {
                return BadRequest("Không tồn tại khách hàng này");
            }
            else
            {
                return Ok(customer);
            }
        }
       


        public class CustomerIDRemove
        {
            public int CustomerId { get; set; }
        }
        [HttpPost("DeleteCustomer")]
        [ClaimRequirement(PermissionAction.CUSTOMER_DELETE)]
        public async Task<IActionResult> DeleteCustomer(CustomerIDRemove model)
        {
            var customer = await _context.Customers.FindAsync(model.CustomerId);
            if (customer == null)
                return BadRequest("Khách hàng này không tồn tại");

            customer.IsDeleted = true;
            if (await _context.SaveChangesAsync() > 0)
            {
                return Ok(new
                {
                    success = true,
                    message = "Xóa khách hàng thành công",
                    data = customer
                });
            }

            return StatusCode(500, "Xóa khách hàng thất bại do lỗi database");
        }


        [HttpPost("DeleteMultipleCustomers")]
        [ClaimRequirement(PermissionAction.CUSTOMER_DELETE)]
        public async Task<IActionResult> DeleteMultipleCustomers(CustomerIDRemove[] customerIDRemoves)
        {
            if (customerIDRemoves == null || customerIDRemoves.Length == 0)
                return Ok(new ErrorModel {
                    success = false,
                    message = "Danh sách khách hàng cần xóa không hợp lệ.",
                });

            var customerIds = customerIDRemoves.Select(x => x.CustomerId).ToList();

            if (!await _context.Customers.AnyAsync(c => customerIds.Contains(c.CustomerId)))
                return Ok(new ErrorModel
                {
                    success = false,
                    message = "Không tìm thấy khách hàng để xóa.",
                });

            var customers = await _context.Customers.Where(c => customerIds.Contains(c.CustomerId)).ToListAsync();

            _context.Customers.RemoveRange(customers);
            await _context.SaveChangesAsync();

            return Ok(new ErrorModel
            { 
                success = true,
                message = $"Đã xóa thành công {customers.Count} khách hàng."
            });
        }


        [HttpGet("ExportCustomer")]
        [ClaimRequirement(PermissionAction.CUSTOMER_EXPORT)]
        public async Task<IActionResult> ExportCustomer()
        {
            try
            {
                var customerList = await (
                    from c in _context.Customers
                    join r in _context.CustomerRanks on c.RankId equals r.RankId into rankGroup
                    from rank in rankGroup.DefaultIfEmpty()
                    select new CustomerSentModel
                    {
                        CustomerId = c.CustomerId,
                        CustomerName = c.CustomerName,
                        Birthday = DateTime.Parse(c.Birthday.ToString()),
                        Email = c.Email,
                        Gender = c.Gender ?? false,
                        NumberPhone = c.NumberPhone,
                        Password = c.Password,
                        RankId = c.RankId ?? 0,
                        RankName = rank != null ? rank.RankName : "Chưa có",
                        TotalMoney = c.TotalMoney ?? 0,
                        TotalPoints = c.TotalPoints ?? 0
                    }).ToListAsync();

                if (customerList == null || customerList.Count == 0)
                {
                    return NotFound("Không có dữ liệu khách hàng để xuất.");
                }

                using (var package = new ExcelPackage())
                {
                    var worksheet = package.Workbook.Worksheets.Add("Customer");

                    var headers = new string[]
                    {
                "CustomerId", "CustomerName", "NumberPhone", "Email", "Birthday",
                "Gender", "RankName", "TotalPoints", "TotalMoney"
                    };

                    for (int col = 0; col < headers.Length; col++)
                    {
                        worksheet.Cells[1, col + 1].Value = headers[col];
                        worksheet.Cells[1, col + 1].Style.Font.Bold = true;
                    }

                    int row = 2;
                    foreach (var customer in customerList)
                    {
                        worksheet.Cells[row, 1].Value = customer.CustomerId;
                        worksheet.Cells[row, 2].Value = customer.CustomerName ?? "N/A";
                        worksheet.Cells[row, 3].Value = customer.NumberPhone ?? "N/A";
                        worksheet.Cells[row, 4].Value = customer.Email ?? "N/A";
                        worksheet.Cells[row, 5].Value = customer.Birthday.ToString("yyyy-MM-dd HH:mm:ss");
                        worksheet.Cells[row, 5].Style.Numberformat.Format = "yyyy-MM-dd HH:mm:ss";
                        worksheet.Cells[row, 6].Value = customer.Gender ? "Nam" : "Nữ";
                        worksheet.Cells[row, 7].Value = customer.RankName;
                        worksheet.Cells[row, 8].Value = customer.TotalPoints;
                        worksheet.Cells[row, 9].Value = customer.TotalMoney;
                        row++;
                    }

                    string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "TempFiles");
                    if (!Directory.Exists(folderPath))
                        Directory.CreateDirectory(folderPath);

                    string fileName = $"Customers_{Guid.NewGuid()}.xlsx";
                    string filePath = Path.Combine(folderPath, fileName);

                    await System.IO.File.WriteAllBytesAsync(filePath, package.GetAsByteArray());
                    Task.Run(async () =>
                    {
                        await Task.Delay(60000);
                        if (System.IO.File.Exists(filePath))
                        {
                            System.IO.File.Delete(filePath);
                        }
                    });

                    return Ok(new { filePath = fileName });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi trong quá trình xuất file: {ex.Message}");
            }
        }

        [HttpGet("DeleteFile/{filePath}")]
        public IActionResult DeleteFile(string filePath)
        {
            if (string.IsNullOrEmpty(filePath))
            {
                return BadRequest(new { success = false, message = "Đường dẫn file không hợp lệ" });
            }

          
           filePath = filePath.Replace("..", "").Replace("/", "").Replace("\\", "");

            string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "TempFiles");
            string fullPath = Path.Combine(folderPath, filePath);
            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
                return Ok(new ErrorModel { success = true, message = "Đã xóa file thành công" });
            }
            else
            {
                return Ok(new ErrorModel { success = false, message = "File không tồn tại" });
            }
        }

        [HttpPost("AddCustomers")]
        [ClaimRequirement(PermissionAction.CUSTOMER_ADD)]
        public async Task<IActionResult> AddCustomers(CustomerReceiveModel[] customerList)
        {
            if (customerList == null || customerList.Length == 0)
                return BadRequest("Dữ liệu không hợp lệ!");

            var incomingIds = customerList.Select(m => m.CustomerId).ToList();
            var incomingEmails = customerList.Select(m => m.Email).ToList();
            var incomingPhones = customerList.Select(m => m.NumberPhone).ToList();

            var existingCustomers = await _context.Customers
                .Where(c => incomingIds.Contains(c.CustomerId) ||
                            incomingEmails.Contains(c.Email) ||
                            incomingPhones.Contains(c.NumberPhone))
                .Select(c => new { c.CustomerId, c.Email, c.NumberPhone })
                .ToListAsync();

            var existingIdsSet = new HashSet<int>(existingCustomers.Select(c => c.CustomerId));
            var existingEmailsSet = new HashSet<string>(existingCustomers.Select(c => c.Email));
            var existingPhonesSet = new HashSet<string>(existingCustomers.Select(c => c.NumberPhone));

            var customersToAdd = new List<Customer>();

            foreach (var model in customerList)
            {
                if (existingIdsSet.Contains(model.CustomerId) ||
                    existingEmailsSet.Contains(model.Email) ||
                    existingPhonesSet.Contains(model.NumberPhone))
                {
                    continue;
                }

                customersToAdd.Add(new Customer
                {
                    Email = model.Email,
                    NumberPhone = model.NumberPhone,
                    UserName = null,
                    Password = null,
                    Birthday = model.Birthday,
                    CustomerName = model.CustomerName,
                    Gender = model.Gender,
                    IsDeleted = false,
                    TotalMoney = model.TotalMoney,
                    TotalPoints = model.TotalPoints,
                    RankId = 1,
                    Status = true,
                    UrlAvatar = null
                });
            }

            if (customersToAdd.Any())
            {
                await _context.Customers.AddRangeAsync(customersToAdd);
                await _context.SaveChangesAsync();
                return Ok(new ErrorModel
                {
                    success = true,
                    message = $"Thêm {customersToAdd.Count} khách hàng thành công",
               
                });
            }

            return Ok(new ErrorModel
            {
                success = false,
                message = "Tất cả khách hàng đều đã tồn tại trong hệ thống"
            });
        }


    }
}
