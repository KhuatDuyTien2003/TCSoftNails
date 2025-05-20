namespace NailsTcsoft3.Data
{
    public class Supplier
    {
        public int SupplierId { get; set; }
        public string SupplierName { get; set; } = null!;
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public decimal money { get; set; }
        public bool IsDeleted { get; set; }
        public bool Status { get; set; }
    }
}
