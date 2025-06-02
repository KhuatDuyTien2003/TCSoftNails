using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailsTcsoft3.Data;
using NailsTcsoft3.Models;
using System.Net.WebSockets;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly ThuctapKtktcnNail2025Context _context;

        public ReportController(ThuctapKtktcnNail2025Context context)
        {   
            _context = context;

        }

        public class ReportResponseModel
        {
           public DoanhThuTheoNgay[] doanhThuTheoNgays { get; set; }
            public MonthlyReportModel[] monthlyReports { get; set; }
        }

        [HttpGet("GetReport")]
        public async Task<IActionResult> GetReport()
        {
            var reportData = await _context.Database.SqlQueryRaw<DoanhThuTheoNgay>("exec PROC_REPORT_DOANH_THU").ToListAsync(); 
            var monthlyReport = await _context.Database.SqlQueryRaw<MonthlyReportModel>("exec PROC_REPORT_TONG_HOP_THANG_FULL").ToListAsync(); 
            var reportResponse = new ReportResponseModel
            {
                doanhThuTheoNgays = reportData.ToArray(),
                monthlyReports = monthlyReport.ToArray()
            };
            // Simulate a report generation

            if (reportData == null || !reportData.Any())
            {
                return NotFound(new ResponseModel<ReportResponseModel>
                {
                    data = null,
                    success = false,
                    message = "Không có dữ liệu báo cáo"
                });
            }
            else { 
            return Ok(new ResponseModel<ReportResponseModel>
            {
                data =  reportResponse,
                success = true,
                message = "Lấy báo cáo doanh thu thành công"
            });
        }
        }

      
    }
}
