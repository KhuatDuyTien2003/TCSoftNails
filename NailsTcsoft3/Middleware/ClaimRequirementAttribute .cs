using Microsoft.AspNetCore.Mvc;
using NailsTcsoft3.Models.Enum;
using System.Security.Claims;

namespace NailsTcsoft3.Middleware
{
    public class ClaimRequirementAttribute : TypeFilterAttribute
    {
        public ClaimRequirementAttribute(PermissionAction  permission) : base(typeof(ClaimRequirementFilter))
        {
            Arguments = new object[] { permission };
        }
    }
}
