using NailsTcsoft3.Models.Enum;

namespace NailsTcsoft3.Models
{
    public class BillSendModel
    {
        public int billId { get; set; }
        public DateTime? billDate { get; set; }
        public int? customerId { get; set; }
        public string? customerName { get; set; }
        public string? numberPhone { get; set; }
        public decimal? moneyPoint { get; set; }
        public double? value_data { get; set; }

        public decimal? totalBill { get; set; }

        public int? receptionId { get; set; }
        public BillStatus? statusBill { get; set; }
        public bool? isPay { get; set; }
        public string? receptionName { get; set; }

        public List<BillSendDetail> BillSendDetails { get; set; } = new List<BillSendDetail>();
    }

    public class BillSendDetail
    {
        public string? proAndSerName { get; set; }
        public int? quantity { get; set; }
        public decimal? unitPrice { get; set; }
        public decimal? totalMoney { get; set; }
        public int? serviceStaffId { get; set; }
        public string? serviceStaffName { get; set; }
        public int? proAndSerId { get; set; }

    }
}
