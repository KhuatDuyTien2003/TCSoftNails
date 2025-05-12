using System.ComponentModel.DataAnnotations;

namespace NailsTcsoft3.Models
{
    public class ProductForm
    {

        public string ProAndSerName { get; set; } = null!;

        public string? ProAndSerCode { get; set; }

        public int? WorkTime { get; set; }

        public int? InventoryQuantity { get; set; }

        public decimal OriginalPrice { get; set; }

        public decimal SellingPrice { get; set; }

        public int? Unit { get; set; }

        public int? ProductTypeId { get; set; }

        public int? Commission { get; set; }
        public List<IFormFile>? Images { get; set; }

        public byte ProAndSerType { get; set; }

        [DataType(DataType.Date)]
        public DateTime? ExpiryDate { get; set; }

        public string? Description { get; set; }

        public byte Status { get; set; }
    }
}
