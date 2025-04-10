using NailsTcsoft3.Models;
using System.Text.RegularExpressions;

namespace NailsTcsoft3.repository
{
    public class SaveImageRepo : ISaveImageRepo
    {
        private readonly IWebHostEnvironment _env;

        public SaveImageRepo(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<ResponseModel<string>> SaveImageAsync(string base64Image)
        {
            if (string.IsNullOrEmpty(base64Image))
            {
                return new ResponseModel<string>{success = false,message =  "Dữ liệu ảnh không được để trống.", data = null};
            }

            var regex = new Regex(@"^data:image\/(png|jpg|jpeg|gif|bmp);base64,", RegexOptions.IgnoreCase);
            if (!regex.IsMatch(base64Image))
            {
                return new ResponseModel<string> { success = false, message = "Định dạng ảnh không hợp lệ. Chỉ hỗ trợ PNG, JPG, JPEG, GIF, BMP.", data = null };
              
            }

            var base64Parts = base64Image.Split(',');
            if (base64Parts.Length != 2)
            {
                return new ResponseModel<string> { success = false, message = "\"Dữ liệu ảnh không hợp lệ.", data = null };
            }

            try
            {
                byte[] imageBytes = Convert.FromBase64String(base64Parts[1]);
                string folderPath = Path.Combine(_env.WebRootPath, "uploads");

                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }

                string fileName = $"{Guid.NewGuid()}.png";
                string filePath = Path.Combine(folderPath, fileName);

                await File.WriteAllBytesAsync(filePath, imageBytes);
                return new ResponseModel<string> {success = true,message = "Ảnh đã được lưu thành công.",data = fileName };
            }
            catch (Exception ex)
            {
                return new ResponseModel<string> { success = true, message = "Lỗi!!!!!", data =  null };
            }
        }

     
    }

 
}
