using System;
using System.Collections.Generic;

namespace NailsTcsoft3.Data;

public partial class BillDetail
{
    public int Id { get; set; }

    public int BillId { get; set; }

    public int? ProAndSerId { get; set; }

    public int? Quantity { get; set; }

    public decimal? UnitPrice { get; set; }

    public int? StaffId { get; set; }

    public decimal? TotalMoney { get; set; }

    public bool? IsDeleted { get; set; }

    public bool? Status { get; set; }
}
