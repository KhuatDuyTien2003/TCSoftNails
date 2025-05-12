namespace NailsTcsoft3.Models
{
    public class AppointmentSendModel
    {
       
        public int? IdStaff { get; set; }
        public string? StaffName { get; set; }
        public List<AppointmentCustomerModel>? AppointmentCustomer { get; set; }
    }

    public class AppointmentCustomerModel
    { public int IdAppointment { get; set; }
        public string? CustomerName { get; set; }
        public string? Email { get; set; }
        public bool? Gender { get; set; }
        public string? NumberPhone { get; set; }
        public DateTime? TimeStart { get; set; }
        public DateTime? TimeEnd { get; set; }
        public string? Description { get; set; }
        public bool? Status { get; set; }
        public List<AppointmentDetailModel>? AppointmentDetails { get; set; }
    }

    public class AppointmentDetailModel
    {
        public int? IdService { get; set; }
        public string? ProAndSerName { get; set; }
        public int? WorkTime { get; set; }
        public decimal? SellingPrice { get; set; }
    }
}
