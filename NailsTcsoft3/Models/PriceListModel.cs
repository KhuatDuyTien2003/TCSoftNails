namespace NailsTcsoft3.Models
{
    public class PriceListModel
    {
        public int? PriceListId { get; set; }

        public string? PriceListName { get; set; }

      

        public List<PriceListDetailModel> PriceListDetails { get; set; } = new List<PriceListDetailModel>();
    }

    public class PriceListDetailModel
    {
        public int? ProductId { get; set; }

        public decimal? SellPrice { get; set; }


    }   
}
