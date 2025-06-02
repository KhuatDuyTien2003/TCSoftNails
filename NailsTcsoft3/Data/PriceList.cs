using System;
using System.Collections.Generic;

namespace NailsTcsoft3.Data;

public partial class PriceList
{
    public int PriceListId { get; set; }

    public string PriceListName { get; set; } = null!;

    public Decimal? ValuePriceList { get; set; }

    public bool? PriceListType { get; set; }

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public bool IsDeleted { get; set; }

    public bool Status { get; set; }
}
