using System;
using System.Collections.Generic;

namespace NailsTcsoft3.Data;

public partial class ProductAndService
{
    public int ProAndSerId { get; set; }

    public string ProAndSerName { get; set; } = null!;

    public string? ProAndSerCode { get; set; }

    public TimeOnly? WorkTime { get; set; }

    public int? InventoryQuantity { get; set; }

    public decimal? OriginalPrice { get; set; }

    public int? Unit { get; set; }

    public string? UrlImage { get; set; }

    public int? ProductTypeId { get; set; }

    public int? Commission { get; set; }

    public byte ProAndSerType { get; set; }

    public bool IsDeleted { get; set; }

    public bool Status { get; set; }
}
