using System;
using System.Collections.Generic;

namespace NailsTcsoft3.Data;
using NailsTcsoft3.Models.Enum;
public partial class Bill
{
    public int BillId { get; set; }

    public DateTime BillDate { get; set; }

    public decimal? TotalMoney { get; set; }
    public decimal? TotalMoneyAfterDiscount { get; set; }

    public int? ReceptionistId { get; set; }

    public int? CustomerId { get; set; }

    public int? Points { get; set; }

    public decimal? MoneyPoint { get; set; }
    public decimal? TotalDiscount { get; set; }

    public int? PromotionId { get; set; }

    public bool? PaymentId { get; set; }

    public bool IsDeleted { get; set; }
    public bool? IsPay { get; set; }

    public bool? Status { get; set; }
    public BillStatus StatusBill { get; set; }
}
