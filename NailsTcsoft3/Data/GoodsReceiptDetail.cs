using System;
using System.Collections.Generic;

namespace NailsTcsoft3.Data;

public partial class GoodsReceiptDetail
{
    public int Id { get; set; }

    public int ReceiptId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public decimal ImportPrice { get; set; }

    public bool IsDeleted { get; set; }

    public bool Status { get; set; }
}
