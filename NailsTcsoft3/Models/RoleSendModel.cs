namespace NailsTcsoft3.Models
{
    public class RoleSendModel
    {
        public string Id { get; set; }
        public string? RoleName { get; set; }
        public List<string> Functions { get; set; } = new List<string>();
  
    }
}
