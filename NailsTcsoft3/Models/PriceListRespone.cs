namespace NailsTcsoft3.Models
{
    public class PriceListRespone
    {
        public int? PriceListId { get; set; }

        public string? PriceListName { get; set; }
        public int? ProductId { get; set; }

        public decimal? SellPrice { get; set; }
    }
}
