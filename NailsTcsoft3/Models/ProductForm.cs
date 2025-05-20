using NailsTcsoft3.Data;
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

        public string? KeptImageIds { get; set; }
        public int[]? ImageIds
        {
            get
            {
                if (string.IsNullOrEmpty(KeptImageIds))
                    return new int[0];
                return KeptImageIds
                    .Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => int.Parse(s))
                    .ToArray();
            }
        }
        public byte ProAndSerType { get; set; }

        [DataType(DataType.Date)]
        public string? ExpiryDate { get; set; }

        public string? Description { get; set; }

        public byte Status { get; set; }

        public string? SelectedProducts { get; set; }
    }
    public class SelectedProductDto
    {
        public int proAndSerId { get; set; }
        public int quantity { get; set; }
    }
}
