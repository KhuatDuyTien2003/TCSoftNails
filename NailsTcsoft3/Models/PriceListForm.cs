namespace NailsTcsoft3.Models
{
    public class PriceListForm
    {
        public string PriceListName { get; set; } = null!;

        public Decimal? ValuePriceList { get; set; }

        public bool? PriceListType { get; set; }

        public DateTime? StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public int[]? CustomerRankIds { get; set; }

        public bool ApplyAll { get; set; }
        public bool Status { get; set; }

    }
}
