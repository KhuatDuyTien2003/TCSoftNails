using System;
using System.Collections.Generic;

namespace NailsTcsoft3.Data;

public partial class AppointmentDetail
{
    public int Id { get; set; }

    public int IdAppointment { get; set; }

    public int IdService { get; set; }

    public bool IsDeleted { get; set; }

    public bool Status { get; set; }
}
