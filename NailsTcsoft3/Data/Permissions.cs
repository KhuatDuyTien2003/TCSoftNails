using System.ComponentModel.DataAnnotations;

namespace NailsTcsoft3.Data
{
    public class Permissions
    {
        [Key] 
        public int Id { get; set; }
        public string FunctionId { get; set; }
        public string ActionId { get; set; }
        public string RoleId { get; set; }
    }
}
