using System;
using System.Collections.Generic;

namespace NailsTcsoft3.Data;

public partial class GoodsReceipt
{
    public int ReceiptId { get; set; }

    public DateTime ImportDate { get; set; }

    public decimal? TotalMoney { get; set; }

    public string? Comment { get; set; }

    public int? AccountantId { get; set; }

    public bool IsDeleted { get; set; }

    public bool Status { get; set; }
}
