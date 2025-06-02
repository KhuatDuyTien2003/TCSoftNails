using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailsTcsoft3.Data;
using NailsTcsoft3.Models;
 using Microsoft.AspNetCore.Authorization;
using NailsTcsoft3.Middleware;
using NailsTcsoft3.Models.Enum;

namespace NailsTcsoft3.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class PermissionController : ControllerBase
    {
        private readonly ThuctapKtktcnNail2025Context _context;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<Account> _userManager;
        public PermissionController(ThuctapKtktcnNail2025Context context, UserManager<Account> userManager, RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }
        [ClaimRequirement(PermissionAction.ROLE_VIEW)]

        [HttpGet]
  
        public IActionResult GetRoles()
        {
            var roles = _context.Database.SqlQueryRaw<RoleModel>("EXEC PROC_GET_ALL_ROLE").ToList();

            if (roles == null || !roles.Any())
            {
                return Ok(new ResponseModel<List<IdentityRole>>
                {
                    success = false,
                    message = "Không có quyền nào",
                    data = null
                });
            }

            var roleList = new List<RoleSendModel>();

            foreach (var item in roles)
            {
                var role = roleList.Find(r => r.Id == item.Id);
                if (role != null)
                {
                    var function = $"{item.Function}:{item.Action}";
                    role.Functions.Add(function);
                }
                else
                {
                    var newRole = new RoleSendModel
                    {
                        Id = item.Id,
                        RoleName = item.RoleName,
                        Functions = new List<string> { $"{item.Function}:{item.Action}" }
                    };
                    roleList.Add(newRole);
                }
            }

            return Ok(new ResponseModel<List<RoleSendModel>>
            {
                success = true,
                message = "Lấy danh sách quyền thành công",
                data = roleList
            });
        
        }
        [HttpPost("CreateRole")]
        [ClaimRequirement(PermissionAction.ROLE_ADD)]
        public async Task<IActionResult> CreateRole([FromBody] RoleSendModel roleSendModel)
        {
            var role = new IdentityRole
            {
                Id = Guid.NewGuid().ToString(),
                Name = roleSendModel.RoleName,
                NormalizedName = roleSendModel.RoleName.ToUpper()
            };

            var result = await _roleManager.CreateAsync(role);

            if (!result.Succeeded)
            {
                return BadRequest(new ResponseModel<string>
                {
                    success = false,
                    message = "Tạo nhóm quyền thất bại",
                    data = null
                });
            }

            return Ok(new ResponseModel<string>
            {
                success = true,
                message = "Tạo nhóm quyền thành công",
                data = null
            });
        }

        [HttpPut("UpdateRole")]
        [ClaimRequirement(PermissionAction.ROLE_EDIT)]

        public async Task<IActionResult> UpdateRole([FromBody] RoleSendModel roleSendModel)
        {
            var role = await _roleManager.FindByIdAsync(roleSendModel.Id);
            if (role == null)
            {
                return NotFound(new ResponseModel<IdentityRole>
                {
                    success = false,
                    message = "Không tìm thấy quyền",
                    data = null
                });
            }

            // Cập nhật tên role
            role.Name = roleSendModel.RoleName;
            role.NormalizedName = roleSendModel.RoleName.ToUpper();
            var result = await _roleManager.UpdateAsync(role);

            if (!result.Succeeded)
            {
                return BadRequest(new ResponseModel<IdentityRole>
                {
                    success = false,
                    message = "Cập nhật quyền thất bại",
                    data = null
                });
            }

           
            var oldPermissions = _context.Permissions.Where(p => p.RoleId == role.Id);
            _context.Permissions.RemoveRange(oldPermissions);

            foreach (var function in roleSendModel.Functions)
            {
                var parts = function.Split(':');
                if (parts.Length == 2)
                {
                    var permission = new Permissions
                    {
                        RoleId = role.Id,
                        FunctionId = parts[0],
                        ActionId = parts[1]
                    };
                    _context.Permissions.Add(permission);
                }
            }

       
            await _context.SaveChangesAsync();

            return Ok(new ResponseModel<IdentityRole>
            {
                success = true,
                message = "Cập nhật quyền thành công",
                data = role
            });
        }
        [HttpDelete("DeleteRole/{id}")]
        [ClaimRequirement(PermissionAction.ROLE_DELETE)]

        public async Task<IActionResult> DeleteRole(string id)
        {
            var role = await _roleManager.FindByIdAsync(id);
            if (role == null)
            {
                return NotFound(new ResponseModel<IdentityRole>
                {
                    success = false,
                    message = "Không tìm thấy quyền",
                    data = null
                });
            }

            // Xóa các permissions liên quan đến role
            var permissions = _context.Permissions.Where(p => p.RoleId == id);
            _context.Permissions.RemoveRange(permissions);
            await _context.SaveChangesAsync();

            // Xóa role
            var result = await _roleManager.DeleteAsync(role);
            if (result.Succeeded)
            {
                return Ok(new ResponseModel<IdentityRole>
                {
                    success = true,
                    message = "Xóa quyền thành công",
                    data = null
                });
            }

            return BadRequest(new ResponseModel<IdentityRole>
            {
                success = false,
                message = "Xóa quyền thất bại",
                data = null
            });
        }
        [HttpGet("UpdateRoleForUser/{id}/{roleId}")]
        [ClaimRequirement(PermissionAction.ROLE_UPDATEFORUSER)]

        public async Task<IActionResult> UpdateRoleForUser(int id, string roleId)
        {

            var userId = _userManager.Users.FirstOrDefault(x => x.StaffId == id)?.Id;
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new ResponseModel<IdentityUser>
                {
                    success = false,
                    message = "Không tìm thấy người dùng",
                    data = null
                });
            }

            var role = await _roleManager.FindByIdAsync(roleId);
            if (role == null)
            {
                return NotFound(new ResponseModel<IdentityRole>
                {
                    success = false,
                    message = "Không tìm thấy quyền",
                    data = null
                });
            }

            // Kiểm tra nếu user đã có role đó chưa
            if (await _userManager.IsInRoleAsync(user, role.Name))
            {
                return Ok(new ResponseModel<string>
                {
                    success = true,
                    message = "Người dùng đã có quyền này",
                    data = null
                });
            }

            // xóa tất cả roles cũ trước
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);

            var result = await _userManager.AddToRoleAsync(user, role.Name);
            if (result.Succeeded)
            {
                return Ok(new ResponseModel<string>
                {
                    success = true,
                    message = "Cập nhật quyền cho người dùng thành công",
                    data = null
                });
            }

            return BadRequest(new ResponseModel<string>
            {
                success = false,
                message = "Cập nhật quyền cho người dùng thất bại",
                data = null
            });
        }

    }
}
