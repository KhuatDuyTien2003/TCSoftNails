namespace NailsTcsoft3.Models
{
    public class CustomerReceiveModel
    {
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = null!;

        public bool Gender { get; set; }

        public string NumberPhone { get; set; }

        public string Email { get; set; }

        public DateTime Birthday { get; set; }

        public string? UserName { get; set; }
        public string? Password { get; set; } 
        public string UrlAvatar { get; set; }
        public int TotalPoints { get; set; }
        public decimal TotalMoney { get; set; }
       
    }
}
