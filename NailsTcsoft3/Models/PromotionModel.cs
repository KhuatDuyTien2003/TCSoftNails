namespace NailsTcsoft3.Models
{
    public class PromotionModel
    {
        public int PromotionId { get; set; }

        public string? PromotionName { get; set; }

        public bool? PromotionType { get; set; }

        public int? ProductTypeId { get; set; }

        public int? RankId { get; set; }

        public bool? IsPoints { get; set; }

        public decimal? Condition { get; set; }

        public double? Value_data { get; set; }

        public int? Quantity { get; set; }

        public string? UrlImage { get; set; }
    }
}
