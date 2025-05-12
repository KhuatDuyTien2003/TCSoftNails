
namespace NailsTcsoft3.Models
{
    public class AppointmentResponseModel
    {
        public int IdAppointment { get; set; }
        public int? IdStaff { get; set; }
    
        public string? Name { get; set; } 
        public string? Email { get; set; }
        public string? NumberPhone { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }  
        public string? Description { get; set; }
        public bool Status { get; set; }
        public bool? Gender { get; set; }
        public List<ServicetResponse>? SeviceDetail { get; set; }
    }

    public class ServicetResponse
    {
        public int IdAppointment { get; set; }
     
        public int ServiceId { get; set; }
    }
}
