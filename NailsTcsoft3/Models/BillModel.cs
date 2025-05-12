using NailsTcsoft3.Models.Enum;

namespace NailsTcsoft3.Models
{
    public class BillModel
    {
        public DateTime? billDate { get; set; }
        public int billId { get; set; }
        public int? customerId { get; set; } 
        public string? customerName { get; set; }
        public string? numberPhone { get; set; }
        public decimal? moneyPoint { get; set; }
        public double? value_data { get; set; }
        public string? proAndSerName { get; set; }
        public int? quantity { get; set; }
        public decimal? unitPrice { get; set; }
        public decimal? totalMoney { get; set; }
        public decimal? totalBill { get; set; }
        public string? serviceStaffName { get; set; }
        public string? receptionName { get; set; }
        public int? receptionId { get; set; }
        public int? serviceStaffId { get; set; }
        public int? proAndSerId { get; set; }
        public BillStatus? StatusBill { get; set; }
        public bool? isPay { get; set; }

    }
}
