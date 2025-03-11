namespace NailsTcsoft3.Models
{
    public class StaffModel
    {
        public string StaffName { get; set; } = null!;
        public string Email { get; set; }

        public bool? Gender { get; set; }

        public string? NumberPhone { get; set; }

        public DateTime Birthday { get; set; }

        public string? UrlAvatar { get; set; }
    }
}
