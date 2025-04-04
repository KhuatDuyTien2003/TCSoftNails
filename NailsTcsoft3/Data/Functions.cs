using System.ComponentModel.DataAnnotations;

namespace NailsTcsoft3.Data
{
    public class Functions
    {
        [Key]
        public string Id { get; set; }
        public string Name { get; set; }
        public string Url { get; set; }
        public string? ParentId { get; set; }
        public int? SortOrder { get; set; }
        public string? CssClass { get; set; }   
        public bool IsMenu { get; set; }
        public bool Status { get; set;}
        public bool IsAdmin { get; set; }
    }
}
