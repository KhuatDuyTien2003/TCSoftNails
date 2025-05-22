using System;
using System.Collections.Generic;

namespace NailsTcsoft3.Data;

public partial class GoodsReceipt
{
    public int ReceiptId { get; set; }

    public DateTime ImportDate { get; set; }
    public DateTime LastUpdate {  get; set; }

    public decimal TotalMoney { get; set; }

    public decimal PaymentMoney { get; set; } 

    public int TotalQuantity { get; set; }

    public int TotalProduct { get; set; }
    public decimal Due { get; set; }


    public string? ReceiptCode { get; set; }

    public int SupplierId { get; set; }

    public string? Comment { get; set; }

    public int? AccountantId { get; set; }

    public bool IsDeleted { get; set; }

    public int Status { get; set; }
}
