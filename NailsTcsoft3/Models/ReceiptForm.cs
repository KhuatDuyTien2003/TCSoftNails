using NailsTcsoft3.Data;

namespace NailsTcsoft3.Models
{
    public class ReceiptForm
    {
        public decimal TotalMoney { get; set; }

        public decimal PaymentMoney { get; set; }
        public decimal Due { get; set; }

        public DateTime ImportDate { get; set; }
        public string? ReceiptCode { get; set; }

        public int SupplierId { get; set; }

        public string? Comment { get; set; }

        public int? AccountantId { get; set; }

        public int Status { get; set; }
        public string? SelectedProducts { get; set; }
    }
    public class GoodsReceiptDetailForm
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal ImportPrice { get; set; }

    }
}
