using System;
using System.Collections.Generic;

namespace NailsTcsoft3.Data;

public partial class StaffService
{
    public int Id { get; set; }

    public int StaffId { get; set; }

    public int ServiceId { get; set; }

    public bool IsDeleted { get; set; }

    public bool Status { get; set; }
}
