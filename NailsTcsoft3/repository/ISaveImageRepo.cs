using NailsTcsoft3.Models;

namespace NailsTcsoft3.repository
{
    public interface ISaveImageRepo
    {
        Task<ResponseModel<string>> SaveImageAsync(string base64Image);
    }
}
