using Microsoft.IdentityModel.Tokens;
using NailsTcsoft3.Data;

namespace NailsTcsoft3.Models
{
    public class GoodsReceiptFilter
    {
        public DateTime? TimeStart { get; set; }
        public DateTime? TimeEnd { get; set; }

        public string? ReceiptCode { get; set; }

        public int? Days { get; set; }

        public string? ProductName { get; set; }
        public string? SupplierName { get; set; }
        public string? AccountantName { get; set; }

        public List<int>? Status { get; set; }
        
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
