using System;
using System.Collections.Generic;

namespace NailsTcsoft3.Data;

public partial class PriceListDetail
{
    public int Id { get; set; }

    public int PriceListId { get; set; }

    public int ProductId { get; set; }

    public decimal SellPrice { get; set; }

    public bool IsDelete { get; set; }

    public bool Status { get; set; }
}
