using NailsTcsoft3.Data;

namespace NailsTcsoft3.Models
{
    public class GoodsReceiptForm
    {
        public DateTime ImportDate { get; set; }

        public decimal TotalMoney { get; set; }

        public int PaymentMethod { get; set; }

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

        public bool Status { get; set; }
    }
}
