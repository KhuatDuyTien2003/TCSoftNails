using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailsTcsoft3.Data;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class HeaderController : ControllerBase
    {
        ThuctapKtktcnNail2025Context _context;
        public HeaderController(ThuctapKtktcnNail2025Context context)
        {
            _context = context;
        }
        [HttpGet]
        public async Task<IActionResult> GetHeader()
        {
            var header = await _context.Functions.ToListAsync();
            return Ok(header);
        }   
    }
}
