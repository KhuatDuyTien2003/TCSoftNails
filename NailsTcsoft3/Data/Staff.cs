using System;
using System.Collections.Generic;

namespace NailsTcsoft3.Data;

public partial class Staff
{
    public int StaffId { get; set; }

    public string StaffName { get; set; } = null!;

    public bool? Gender { get; set; }

    public string? NumberPhone { get; set; }

    public string? Email { get; set; }

    public DateTime? Birthday { get; set; }

    public string? UrlAvatar { get; set; }

    public double? TotalStar { get; set; }

    public DateTime? JoinDate { get; set; }

    public bool IsDeleted { get; set; }

    public bool Status { get; set; }
}
