namespace NailsTcsoft3.Models
{
    public class ProductFilter
    {
        // Tham số tìm kiếm
        public string SearchTerm { get; set; } = "";

        // Truyền về dưới dạng chuỗi phân cách bằng dấu phẩy (ví dụ: "1,2,3")
        public string ProductTypes { get; set; } = "";

        // Thuộc tính chuyển đổi chuỗi thành mảng số nguyên
        public int[] ProductTypesArray
        {
            get
            {
                if (string.IsNullOrEmpty(ProductTypes))
                    return new int[0];
                return ProductTypes
                    .Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => int.Parse(s))
                    .ToArray();
            }
        }
        public int PriceListId { get; set; } = 0;
        public int ProductGroup { get; set; } = 0;
        public int Status { get; set; } = 0;
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public int Stock { get; set; } = 0;
    }
}
