using NailsTcsoft3.Models.Enum;

namespace NailsTcsoft3.Models
{
    public class BillResponseModel
    {

        public decimal TotalMoney { get; set; }
        public decimal TotalMoneyAfterDiscount { get; set; }

        public int ReceptionistId { get; set; }
        public int BillId { get; set; }

        public int CustomerId { get; set; }

        public int? Points { get; set; }
        public BillStatus? StatusBill { get; set; }

        public decimal? MoneyPoint { get; set; }
        public decimal? TotalDiscount { get; set; }

        public int? PromotionId { get; set; }

        public bool PaymentId { get; set; }

        public bool IsPay { get; set; }

        public List<BillDetailResponseModel> BillDetails { get; set; } = new List<BillDetailResponseModel>();

    }

    public class BillDetailResponseModel
    {
        
        public int ProAndSerId { get; set; }
        public int BillId { get; set; }

        public int? Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public int? StaffId { get; set; }

        public decimal TotalMoney { get; set; }

    }
}
