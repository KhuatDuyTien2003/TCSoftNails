using System;
using System.Collections.Generic;

namespace NailsTcsoft3.Data;

public partial class Feedback
{
    public int FeedbackId { get; set; }

    public int? CustomerId { get; set; }

    public int? StaffId { get; set; }

    public int? ProAndSerId { get; set; }

    public double? Star { get; set; }

    public string? Comment { get; set; }

    public bool IsDelete { get; set; }

    public bool Status { get; set; }
}
