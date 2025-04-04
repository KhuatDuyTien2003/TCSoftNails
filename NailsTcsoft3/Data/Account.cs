using Microsoft.AspNetCore.Identity;

namespace NailsTcsoft3.Data
{
    public class Account:IdentityUser
    {
        public int StaffId { get; set; }
        public bool? IsDelete { get; set; }
        public bool? Status { get; set; }
    }
}
