using System.ComponentModel.DataAnnotations;

namespace NailsTcsoft3.Data
{
    public class RefreshToken
    {
        [Key]
        public int Id { get; set; }
        public string Token { get; set; }
        public string idStaff { get; set; }
        public DateTime Expiration { get; set; }
    }
}
