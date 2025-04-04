using System;
using System.Collections.Generic;

namespace NailsTcsoft3.Data;

public partial class Category
{
    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = null!;

    public bool IsDeleted { get; set; }

    public bool Status { get; set; }
}
