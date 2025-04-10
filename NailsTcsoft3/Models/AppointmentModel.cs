namespace NailsTcsoft3.Models
{
    public class AppointmentModel
    {
        public int IdAppointment { get; set; }
        public int? IdStaff { get; set; }
        public string? StaffName { get; set; }

        public string? Name { get; set; }            // Tên người đặt (khách hàng?)
        public string? Email { get; set; }
        public string? NumberPhone { get; set; }

        public string? ProAndSerName { get; set; }   // Tên dịch vụ hoặc sản phẩm
        public int? WorkTime { get; set; }           // Thời gian làm việc (phút?)
        public decimal? SellingPrice { get; set; }   // Giá bán
        public int? ProAndSerId { get; set; }

        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }

        public string? Description { get; set; }
    }
}
