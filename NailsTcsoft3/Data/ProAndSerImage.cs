using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NailsTcsoft3.Data
{
    public class ProAndSerImage
    {
        [Key]
        public int ImageId { get; set; }

        public int ProAndSerId { get; set; }

        public string ImageUrl { get; set; } = null!;

    }
}
