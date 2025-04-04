using System;
using System.Collections.Generic;

namespace NailsTcsoft3.Data;

public partial class WorkSchedule
{
    public int WorkScheduleId { get; set; }

    public int StaffId { get; set; }

    public int CustomerId { get; set; }

    public byte Shift { get; set; }
    public DateTime WorkDate { get; set; }

    public bool IsDone { get; set; }

    public bool IsDeleted { get; set; }

    public bool Status { get; set; }
}
