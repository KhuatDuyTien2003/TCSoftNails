namespace NailsTcsoft3.Models
{
    public class WorkDateModel
    {

        public int workScheduleId { get; set; }

        public int? staffId { get; set; }
        public int? customerId { get; set; }
        public string? staffName { get; set; }
        public string? customerName { get; set; }
        public byte? shift { get; set; }
        public DateTime? WorkDate { get; set; }
        public bool? isDone { get; set; }

    }
}
