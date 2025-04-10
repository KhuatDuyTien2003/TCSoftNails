using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailsTcsoft3.Data;
using NailsTcsoft3.Models;
using NailsTcsoft3.repository;
using Newtonsoft.Json;
using OfficeOpenXml;
using System.Drawing.Printing;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class StaffController : ControllerBase
    {
        private readonly ThuctapKtktcnNail2025Context _context;

        private readonly UserManager<Account> _userManager;
        private readonly ISaveImageRepo _saveImage;

        public StaffController(ThuctapKtktcnNail2025Context context, UserManager<Account> userManager, ISaveImageRepo saveImage)
        {
            _context = context;
            _saveImage = saveImage;
            _userManager = userManager;
        }

        [HttpPost("CreateStaff")]
        public async Task<IActionResult> Register(StaffModel model)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var staff = await _context.Staff
                        .FirstOrDefaultAsync(s => s.Email == model.email || s.NumberPhone == model.numberPhone);

                    if (staff != null)
                    {
                        if (staff.Email == model.email)
                        {
                            return Ok(new ResponseModel<string>
                            {
                                success = false,
                                message = "Email này đã tồn tại",
                                data = null
                            });
                        }

                        if (staff.NumberPhone == model.numberPhone)
                        {
                            return Ok(new ResponseModel<string>
                            {
                                success = false,
                                message = "Số điện thoại này đã tồn tại",
                                data = null
                            });
                        }
                    }

                    var imageResponse = await _saveImage.SaveImageAsync(model.urlAvatar);

                    var newStaff = new Staff
                    {
                        NumberPhone = model.numberPhone,
                        Email = model.email,
                        StaffName = model.staffName,
                        Birthday = model.birthday,
                        Gender = model.gender,
                        JoinDate = DateTime.Now,
                        Status = true,
                        TotalStar = 0,
                        UrlAvatar = imageResponse?.data,
                        IsDeleted = false
                    };

                    _context.Staff.Add(newStaff);
                    await _context.SaveChangesAsync();

                    if (!string.IsNullOrEmpty(model.serviceId))
                    {
                        string[] serviceIds = model.serviceId.Split(",", StringSplitOptions.RemoveEmptyEntries);
                        List<StaffService> staffService = new List<StaffService>();

                        foreach (var item in serviceIds)
                        {
                            if (int.TryParse(item, out int serviceId))
                            {
                                staffService.Add(new StaffService
                                {
                                    StaffId = newStaff.StaffId,
                                    ServiceId = serviceId,
                                    IsDeleted = false,
                                    Status = true
                                });
                            }
                        }

                        if (staffService.Count > 0)
                        {
                            await _context.StaffServices.AddRangeAsync(staffService);
                        }
                    }

                    var user = new Account
                    {
                        UserName = "staff" + newStaff.StaffId,
                        Email = model.email,
                        StaffId = newStaff.StaffId,
                        Status = true,
                        IsDelete = false
                    };

                    string defaultPassword = user.UserName + "!";
                    var result = await _userManager.CreateAsync(user, defaultPassword);

                    if (!result.Succeeded)
                    {
                        throw new Exception("Tạo tài khoản thất bại: " + string.Join("; ", result.Errors.Select(e => e.Description)));
                    }

                    await transaction.CommitAsync();

                    return Ok(new ResponseModel<string>
                    {
                        success = true,
                        message = "Tạo nhân viên thành công!",
                        data = null
                    });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();

                    return Ok(new ResponseModel<string>
                    {
                        success = false,
                        message = "Lỗi khi tạo nhân viên: " + ex.Message,
                        data = null
                    });
                }
            }
        }

        [HttpPost("AddStaffs")]
        public async Task<IActionResult> AddStaffs(StaffModel[] models)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                List<Staff> newStaffs = new();
                List<StaffService> staffServices = new();
                List<Account> userAccounts = new();

                foreach (var model in models)
                {
                    var existingStaff = await _context.Staff
                        .FirstOrDefaultAsync(s => s.Email == model.email || s.NumberPhone == model.numberPhone);

                    if (existingStaff != null)
                    {
                        return Ok(new ResponseModel<string>
                        {
                            success = false,
                            message = $"Nhân viên có Email: {model.email} hoặc SĐT: {model.numberPhone} đã tồn tại!",
                            data = null
                        });
                    }

                    var imageResponse = await _saveImage.SaveImageAsync(model.urlAvatar);
                    var newStaff = new Staff
                    {
                        NumberPhone = model.numberPhone,
                        Email = model.email,
                        StaffName = model.staffName,
                        Birthday = model.birthday,
                        Gender = model.gender,
                        JoinDate = DateTime.Now,
                        Status = true,
                        TotalStar = 0,
                        UrlAvatar = imageResponse?.data,
                        IsDeleted = false
                    };

                    newStaffs.Add(newStaff);
                }

                await _context.Staff.AddRangeAsync(newStaffs);
                await _context.SaveChangesAsync();

                foreach (var newStaff in newStaffs)
                {
                    string[] serviceIds = models.First(m => m.email == newStaff.Email).serviceId.Split(",");
                    foreach (var item in serviceIds)
                    {
                        staffServices.Add(new StaffService
                        {
                            StaffId = newStaff.StaffId,
                            ServiceId = int.Parse(item),
                            IsDeleted = false,
                            Status = true
                        });
                    }

                    var user = new Account
                    {
                        UserName = "staff" + newStaff.StaffId,
                        Email = newStaff.Email,
                        StaffId = newStaff.StaffId,
                        Status = true,
                        IsDelete = false
                    };
                    userAccounts.Add(user);
                }

                await _context.StaffServices.AddRangeAsync(staffServices);
                await _context.SaveChangesAsync();

                foreach (var user in userAccounts)
                {
                    string defaultPassword = user.UserName + "!";
                    var result = await _userManager.CreateAsync(user, defaultPassword);
                    if (!result.Succeeded)
                    {
                        throw new Exception($"Tạo tài khoản thất bại cho {user.Email}: {string.Join("; ", result.Errors.Select(e => e.Description))}");
                    }
                }

                await transaction.CommitAsync();
                return Ok(new ResponseModel<string>
                {
                    success = true,
                    message = $"Thêm {models.Length} nhân viên thành công!",
                    data = null
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return Ok(new ResponseModel<string>
                {
                    success = false,
                    message = $"Lỗi khi thêm nhân viên: {ex.Message}",
                    data = null
                });
            }
        }


        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10)
        {

            var listStaff = await _context.Database
                                          .SqlQueryRaw<StaffModel>("EXEC PROC_GET_STAFF_EXCEL {0}, {1}, {2}", null, pageSize, page)
                                          .ToListAsync();
            var countStaff = _context.Staff.Where(s => s.IsDeleted == false).Count();
            if (!listStaff.Any())
            {
                return Ok(new ErrorModel
                {
                    success = false,
                    message = "Không có dữ liệu"
                });
            }
            else
            {
                return Ok(new
                {
                    data = listStaff,
                    count = countStaff
                });
            }
        }
        [HttpPost("SearchStaff")]
        public async Task<IActionResult> SearchStaff(SearchStaffModel model)
        {

            var listStaff = await _context.Database
                                          .SqlQueryRaw<StaffModel>("EXEC PROC_SEARCH_STAFF {0}, {1}, {2}, {3}, {4}, {5}", new object[]
        {
            (object?)model.Keyword ?? DBNull.Value,
            (object?)model.FromDate ?? DBNull.Value,
            (object?)model.ToDate ?? DBNull.Value,
            model.ServiceId == 0 ? DBNull.Value : model.ServiceId,
            model.PageNumber ?? 1,
            model.PageSize ?? 10
        })
                                          .ToListAsync();
            var countStaff = _context.Staff.Where(s => s.IsDeleted == false).Count();
            if (!listStaff.Any())
            {
                return Ok(new ErrorModel
                {
                    success = false,
                    message = "Không có dữ liệu",

                });
            }
            else
            {
                return Ok(new
                {
                    data = listStaff,
                    count = countStaff
                });
            }
        }

        [HttpGet("GetStaffById/{id}")]

        public async Task<IActionResult> GetStaffById(int id)
        {
            var result = await _context.Database
     .SqlQueryRaw<StaffModel>("EXEC PROC_GET_STAFF_EXCEL {0}", id)
     .ToListAsync();
            var s = result.FirstOrDefault();
            var staff = new StaffModel
            {
                staffId = s.staffId,
                birthday = s.birthday,
                email = s.email,
                gender = s.gender,
                joinDate = s.joinDate,
                numberPhone = s.numberPhone,
                staffName = s.staffName,
                totalStar = s.totalStar,
                urlAvatar = s.urlAvatar,
                serviceId = s.serviceId,
                serviceName = s.serviceName,
                status = s.status

            };

            if (staff == null)
            {
                return Ok(new ResponseModel<StaffModel>
                {
                    success = false,
                    message = "Không tìm thấy nhân viên",
                    data = null
                });
            }
            else
            {
                return Ok(new ResponseModel<StaffModel>
                {
                    success = true,
                    message = "Lấy dữ liệu thành công",
                    data = staff
                });
            }
        }

        [HttpPost("UpdateStaff")]
        public async Task<IActionResult> UpdateStaff(StaffModel newStaff)
        {
            var staff = await _context.Staff.FindAsync(newStaff.staffId);
            if (staff == null)
            {
                return Ok(new ResponseModel<StaffModel>
                {
                    success = false,
                    message = "Không tìm thấy nhân viên",
                    data = null
                });
            }
            else
            {
                var imageResponse = await _saveImage.SaveImageAsync(newStaff.urlAvatar);
                staff.Birthday = newStaff.birthday;
                staff.Email = newStaff.email;
                staff.Gender = newStaff.gender;

                staff.NumberPhone = newStaff.numberPhone;
                staff.StaffName = newStaff.staffName;

                if (imageResponse.success == true)
                {
                    staff.UrlAvatar = imageResponse.data;
                }

                _context.Entry(staff).State = EntityState.Modified;

                await _context.SaveChangesAsync();
                string[] serviceIds = newStaff.serviceId.Split(",");
                HashSet<int> serviceIdSet = serviceIds.Select(int.Parse).ToHashSet();

                var listStaffService = await _context.StaffServices
                    .Where(s => s.StaffId == newStaff.staffId)
                    .ToListAsync();

                var toAdd = serviceIdSet.Except(listStaffService.Select(s => s.ServiceId))
                    .Select(id => new StaffService
                    {
                        StaffId = newStaff.staffId,
                        ServiceId = id,
                        IsDeleted = false,
                        Status = true
                    });

                var toRemove = listStaffService
                    .Where(s => !serviceIdSet.Contains(s.ServiceId))
                    .ToList();

                await _context.StaffServices.AddRangeAsync(toAdd);
                _context.StaffServices.RemoveRange(toRemove);

                await _context.SaveChangesAsync();

                return Ok(new ResponseModel<StaffModel>
                {
                    success = true,
                    message = "Cập nhật nhân viên thành công",
                    data = newStaff
                });
            }
        }
        [HttpGet("DeleteStaff/{id}")]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            var staff = await _context.Staff.FindAsync(id);
            if (staff == null)
            {
                return Ok(new ResponseModel<StaffModel>
                {
                    success = false,
                    message = "Không tìm thấy nhân viên",
                    data = null
                });
            }
            else
            {
                staff.IsDeleted = true;
                var user = await _userManager.FindByIdAsync(staff.StaffId.ToString());
                if (user != null)
                {
                    user.IsDelete = true;
                    await _userManager.UpdateAsync(user);
                }
                _context.Entry(staff).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return Ok(new ResponseModel<StaffModel>
                {
                    success = true,
                    message = "Xóa nhân viên thành công",
                    data = null
                });
            }
        }
        [HttpGet("StopStartWork/{id}")]
        public async Task<IActionResult> StopStartWork(int id)
        {
            var staff = await _context.Staff.FindAsync(id);
            if (staff == null)
            {
                return Ok(new ResponseModel<StaffModel>
                {
                    success = false,
                    message = "Không tìm thấy nhân viên",
                    data = null
                });
            }
            else
            {
                if (staff.Status)
                {
                    staff.Status = false;
                    var user = await _userManager.FindByIdAsync(staff.StaffId.ToString());
                    if (user != null)
                    {
                        user.Status = false;
                        await _userManager.UpdateAsync(user);
                    }
                    _context.Entry(staff).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                    return Ok(new ResponseModel<StaffModel>
                    {
                        success = true,
                        message = "Tắt quyền hoạt động của " + staff.StaffName + " thành công",
                        data = null
                    });
                }
                else
                {
                    staff.Status = true;
                    var user = await _userManager.FindByIdAsync(staff.StaffId.ToString());
                    if (user != null)
                    {
                        user.Status = true;
                        await _userManager.UpdateAsync(user);
                    }
                    _context.Entry(staff).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                    return Ok(new ResponseModel<StaffModel>
                    {
                        success = true,
                        message = "Bật quyền hoạt động của " + staff.StaffName + " thành công",
                        data = null
                    });
                }

            }
        }

        [HttpGet("ExportStaff")]
        public async Task<IActionResult> ExportStaff()
        {
            try
            {
                var staffList = await _context.Database
                    .SqlQueryRaw<StaffModel>("EXEC PROC_GET_STAFF_EXCEL")
                    .ToListAsync();

                if (staffList == null || staffList.Count == 0)
                {
                    return NotFound("Không có dữ liệu nhân viên để xuất.");
                }

                using (var package = new ExcelPackage())
                {
                    var worksheet = package.Workbook.Worksheets.Add("Staff");

                    var headers = new string[]
                    {
                "StaffId", "StaffName", "NumberPhone", "Email", "Birthday",
                "Gender", "JoinDate", "TotalStar", "Status", "UrlAvatar",
                "ServiceIds", "ServiceNames"
                    };
                    for (int col = 0; col < headers.Length; col++)
                    {
                        worksheet.Cells[1, col + 1].Value = headers[col];
                        worksheet.Cells[1, col + 1].Style.Font.Bold = true;
                        worksheet.Cells[1, col + 1].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                        worksheet.Cells[1, col + 1].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                        worksheet.Cells[1, col + 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                        worksheet.Cells[1, col + 1].Style.Border.BorderAround(OfficeOpenXml.Style.ExcelBorderStyle.Thin);
                    }

                    int row = 2;
                    foreach (var staff in staffList)
                    {
                        worksheet.Cells[row, 1].Value = staff.staffId;
                        worksheet.Cells[row, 2].Value = staff.staffName ?? "N/A";
                        worksheet.Cells[row, 3].Value = staff.numberPhone ?? "N/A";
                        worksheet.Cells[row, 4].Value = staff.email ?? "N/A";
                        worksheet.Cells[row, 5].Value = staff.birthday.HasValue ? staff.birthday.Value.ToString("yyyy-MM-dd") : "N/A";
                        worksheet.Cells[row, 6].Value = staff.gender == true ? "Nam" : "Nữ";
                        worksheet.Cells[row, 7].Value = staff.joinDate.HasValue ? staff.joinDate.Value.ToString("yyyy-MM-dd") : "N/A";
                        worksheet.Cells[row, 8].Value = staff.totalStar;
                        worksheet.Cells[row, 9].Value = staff.status;
                        worksheet.Cells[row, 10].Value = staff.urlAvatar ?? "N/A";
                        worksheet.Cells[row, 11].Value = staff.serviceId ?? "N/A";
                        worksheet.Cells[row, 12].Value = staff.serviceName ?? "N/A";

                        for (int col = 1; col <= headers.Length; col++)
                        {
                            worksheet.Cells[row, col].Style.Border.BorderAround(OfficeOpenXml.Style.ExcelBorderStyle.Thin);
                            worksheet.Cells[row, col].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                        }

                        row++;
                    }
                    worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
                    string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "TempFiles");
                    if (!Directory.Exists(folderPath))
                        Directory.CreateDirectory(folderPath);

                    string fileName = $"Staff_{Guid.NewGuid()}.xlsx";
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

        public class ServiceModel
        {
            public int ServiceId { get; set; }
            public string ServiceName { get; set; }
        }

        [HttpGet("GetServices")]

        public async Task<IActionResult> GetServices()
        {
            var services = _context.ProductAndServices
                .Where(s => s.IsDeleted == false && s.ProAndSerType == 2)
                .Select(s => new ServiceModel
                {
                    ServiceId = s.ProAndSerId,
                    ServiceName = s.ProAndSerName
                });
            if (services == null)
            {
                return Ok(new ResponseModel<ServiceModel>
                {
                    success = false,
                    message = "Không có dịch vụ nào",
                    data = null
                });
            }
            else
            {
                return Ok(new ResponseModel<ServiceModel[]>
                {
                    success = true,
                    message = "Lấy dữ liệu thành công",
                    data = services.ToListAsync().Result.ToArray()
                });
            }
        }
        [HttpGet("GetWorkDate")]
        public async Task<IActionResult> GetWorkDate()
        {
            var workDates = await _context.Database
                .SqlQueryRaw<WorkDateModel>("EXEC PROC_GET_ALL_CALENDAR")
                .ToListAsync();

            if (workDates == null || workDates.Count == 0)
            {
                return Ok(new ResponseModel<WorkDateSendModel>
                {
                    success = false,
                    message = "Không có lịch làm việc nào",
                    data = null
                });
            }

            var workDateSendList = new List<WorkDateSendModel>();

            foreach (var workDate in workDates)
            {
                var existingWorkDateSend = workDateSendList.FirstOrDefault(w => w.staffId == workDate.staffId);
                if (existingWorkDateSend != null)
                {
                    existingWorkDateSend.workSchedule.Add(new WorkScheduleModel
                    {
                        workScheduleId = workDate.workScheduleId,
                        customerId = workDate.customerId,
                        customerName = workDate.customerName,
                        shift = workDate.shift,
                        WorkDate = workDate.WorkDate,
                        isDone = workDate.isDone
                    });
                }
                else
                {

                    var workDateSendModel = new WorkDateSendModel
                    {
                        staffId = int.Parse(workDate.staffId.ToString()),
                        staffName = workDate.staffName,
                        workSchedule = new List<WorkScheduleModel>
                {
                    new WorkScheduleModel
                    {
                        workScheduleId = workDate.workScheduleId,
                        customerId = workDate.customerId,
                        customerName = workDate.customerName,
                        shift = workDate.shift,
                        WorkDate = workDate.WorkDate,
                        isDone = workDate.isDone
                    }
                }
                    };

                    // Add the new model to the list
                    workDateSendList.Add(workDateSendModel);
                }
            }

            return Ok(new ResponseModel<WorkDateSendModel[]>
            {
                success = true,
                message = "Lấy dữ liệu thành công",
                data = workDateSendList.ToArray()
            });
        }


        [HttpGet("GetCustomer")]
        public async Task<IActionResult> GetCustomer()
        {
            var listCustomer = _context.Customers.Where(c => c.IsDeleted == false && c.Status == true).Select(c => new
            {
                CustomerId = c.CustomerId,
                CustomerName = c.CustomerName,
                NumberPhone = c.NumberPhone,
            }).ToList();

            if (listCustomer == null)
            {
                return Ok(new ResponseModel<dynamic>
                {
                    success = false,
                    message = "Không có khách hàng nào",
                    data = null
                });
            }
            else
            {
                return Ok(new ResponseModel<dynamic>
                {
                    success = true,
                    message = "Lấy dữ liệu thành công",
                    data = listCustomer.ToArray()
                });
            }

        }

        [HttpPost("CreateCalendar")]
        public async Task<IActionResult> CreateCalendar(WorkDateModel model)
        {
            var workDate = await _context.WorkSchedules
                .FirstOrDefaultAsync(w => w.StaffId == model.staffId && w.WorkDate == model.WorkDate && model.shift == w.Shift);

            if (workDate != null)
            {
                return Ok(new ResponseModel<string>
                {
                    success = false,
                    message = "Ngày làm việc này đã tồn tại",
                    data = null
                });
            }

            var newWorkDate = new WorkSchedule
            {
                StaffId = int.Parse(model.staffId.ToString()),
                WorkDate = DateTime.Parse(model.WorkDate.ToString()),
                CustomerId = 100,
                Shift = model.shift.HasValue ? model.shift.Value : (byte)0,
                IsDeleted = false,
                IsDone = false,
                Status = true
            };

            _context.WorkSchedules.Add(newWorkDate);
            await _context.SaveChangesAsync();

            return Ok(new ResponseModel<string>
            {
                success = true,
                message = "Tạo lịch làm việc thành công",
                data = null
            });
        }



        [HttpPost("DeleteCalendar/{id}")]
        public async Task<IActionResult> DeleteCalendar(int id)
        {
            var workDate = _context.WorkSchedules
                .FirstOrDefault(w => w.WorkScheduleId == id && w.IsDeleted == false);
            if (workDate == null)
            {
                return Ok(new ResponseModel<string>
                {
                    success = false,
                    message = "Không tìm thấy lịch làm việc",
                    data = null
                });
            }

            workDate.IsDeleted = true;
            _context.Entry(workDate).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new ResponseModel<string>
            {
                success = true,
                message = "Xóa lịch làm việc thành công",
                data = null
            });
        }

        [HttpGet("GetAppointment")]
        public async Task<IActionResult> GetAppointment()
        {
            var listAppointment = await _context.Database
                .SqlQueryRaw<AppointmentModel>("EXEC GET_ALL_APPOINTMENT")
                .ToListAsync();

            if (listAppointment == null || listAppointment.Count == 0)
            {
                return Ok(new ResponseModel<AppointmentModel>
                {
                    success = false,
                    message = "Không có lịch hẹn nào",
                    data = null
                });
            }
            else
            {
                var result = new List<AppointmentSendModel>();
                foreach (var item in listAppointment)
                {
                    var appointment = result.FirstOrDefault(a => a.IdStaff == item.IdStaff);
                    if (appointment != null)
                    {
                        var existingCustomer = appointment.AppointmentCustomer.FirstOrDefault(c => c.NumberPhone == item.NumberPhone && c.Email == item.Email);
                        if (existingCustomer != null)
                        {
                            var AppointmentDetail = new AppointmentDetailModel
                            {

                                IdService = item.ProAndSerId,
                                ProAndSerName = item.ProAndSerName,
                                WorkTime = item.WorkTime,
                                SellingPrice = item.SellingPrice

                            };
                            existingCustomer.AppointmentDetails.Add(AppointmentDetail);

                        }
                        else
                        {
                            appointment.AppointmentCustomer.Add(new AppointmentCustomerModel
                            {

                                CustomerName = item.Name,
                                Email = item.Email,
                                NumberPhone = item.NumberPhone,
                                TimeStart = item.StartTime,
                                TimeEnd = item.EndTime,
                                Note = item.Description,
                                AppointmentDetails = new List<AppointmentDetailModel>
                            {
                                new AppointmentDetailModel
                                {
                                    IdService = item.ProAndSerId,
                                    ProAndSerName = item.ProAndSerName,
                                    WorkTime = item.WorkTime,
                                    SellingPrice = item.SellingPrice
                                }
                            }
                            });
                        }
                    }
                    else
                    {
                        var newAppointment = new AppointmentSendModel
                        {
                            IdStaff = item.IdStaff,
                            StaffName = item.StaffName,
                            AppointmentCustomer = new List<AppointmentCustomerModel>
                            {
                                new AppointmentCustomerModel
                                {

                                    CustomerName = item.Name,
                                    Email = item.Email,
                                    NumberPhone = item.NumberPhone,
                                    TimeStart = item.StartTime,
                                    TimeEnd = item.EndTime,
                                    Note = item.Description,
                                    AppointmentDetails = new List<AppointmentDetailModel>
                                    {
                                        new AppointmentDetailModel
                                        {
                                            IdService = item.ProAndSerId,
                                            ProAndSerName = item.ProAndSerName,
                                            WorkTime = item.WorkTime,
                                            SellingPrice = item.SellingPrice
                                        }
                                    }
                                }
                            }
                        };
                        result.Add(newAppointment);
                    }
                }
                return Ok(new ResponseModel<AppointmentSendModel[]>
                 {
                     success = true,
                     message = "Lấy dữ liệu thành công",
                     data = result.ToArray()
                 });
            }
           
        } 
        }   
    
}
