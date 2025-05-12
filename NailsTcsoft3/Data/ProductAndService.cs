using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NailsTcsoft3.Data;

public partial class ProductAndService
{
    public int ProAndSerId { get; set; }

    public string ProAndSerName { get; set; } = null!;

    public string? ProAndSerCode { get; set; }

    public int? WorkTime { get; set; }

    public int? InventoryQuantity { get; set; }

    public decimal OriginalPrice { get; set; }

    public decimal SellingPrice { get; set; }

    public int? Unit { get; set; }

    public string? UrlImage { get; set; }

    public int? ProductTypeId { get; set; }

    public int? Commission { get; set; }

    public byte ProAndSerType { get; set; }

    [DataType(DataType.Date)]
    public DateTime? ExpiryDate { get; set; }

    public string? Description { get; set; }

    public bool IsDeleted { get; set; }

    public byte Status { get; set; }
}
