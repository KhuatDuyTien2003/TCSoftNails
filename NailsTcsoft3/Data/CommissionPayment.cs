using System;
using System.Collections.Generic;

namespace NailsTcsoft3.Data;

public partial class CommissionPayment
{
    public int PaymentId { get; set; }

    public int StaffId { get; set; }

    public int TotalWork { get; set; }

    public decimal TotalCommission { get; set; }

    public DateTime PaymentDate { get; set; }

    public int AccountantId { get; set; }

    public bool IsDeleted { get; set; }

    public bool Status { get; set; }
}
