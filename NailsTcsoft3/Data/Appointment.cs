using System;
using System.Collections.Generic;

namespace NailsTcsoft3.Data;

public partial class Appointment
{
    public int IdAppointment { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public string? Description { get; set; }

    public string? NumberPhone { get; set; }

    public string? Email { get; set; }

    public string? Name { get; set; }

    public int? IdStaff { get; set; }

    public bool IsDeleted { get; set; }

    public bool Status { get; set; }
}
