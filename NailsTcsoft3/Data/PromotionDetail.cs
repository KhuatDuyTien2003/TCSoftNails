using System;
using System.Collections.Generic;

namespace NailsTcsoft3.Data;

public partial class PromotionDetail
{
    public int Id { get; set; }

    public int PromotionId { get; set; }

    public string PromotionCode { get; set; } = null!;

    public bool IsUsed { get; set; }

    public DateTime? UsedDate { get; set; }

    public int? CustomerId { get; set; }

    public bool IsDeleted { get; set; }

    public bool Status { get; set; }
}
