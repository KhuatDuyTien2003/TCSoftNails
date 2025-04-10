using System;
using System.Collections.Generic;

namespace NailsTcsoft3.Data;

public partial class Customer
{
    public int CustomerId { get; set; }

    public string CustomerName { get; set; } = null!;

    public bool? Gender { get; set; }

    public string? NumberPhone { get; set; }

    public string? Email { get; set; }

    public DateTime? Birthday { get; set; }

    public int? RankId { get; set; }

    public string UserName { get; set; } = null!;

    public string Password { get; set; } = null!;


    public decimal? TotalMoney { get; set; }

    public string? UrlAvatar { get; set; }

    public int? TotalPoints { get; set; }

    public bool IsDeleted { get; set; }

    public bool Status { get; set; }
}
