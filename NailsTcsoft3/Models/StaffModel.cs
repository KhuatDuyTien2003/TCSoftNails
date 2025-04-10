namespace NailsTcsoft3.Models
{
    public class StaffModel
    {
        public int staffId { get; set; }

        public string staffName { get; set; } = null!;

        public bool? gender { get; set; }

        public string? numberPhone { get; set; }

        public string? email { get; set; }

        public DateTime? birthday { get; set; }

        public string? urlAvatar { get; set; }

        public double? totalStar { get; set; }

        public DateTime? joinDate { get; set; }
        public string serviceId { get; set; }
        public string serviceName { get; set; }
        public bool? status { get; set; }

    }
}
