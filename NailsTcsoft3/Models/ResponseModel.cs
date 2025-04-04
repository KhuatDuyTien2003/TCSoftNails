namespace NailsTcsoft3.Models
{
    public class ResponseModel<T>
    {
        public bool success { get; set; }
        public string message { get; set; }
        public T? data { get; set; }
    }
}
