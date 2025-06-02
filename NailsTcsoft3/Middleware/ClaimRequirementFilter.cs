using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Http;
using NailsTcsoft3.Models.Enum;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;
using Newtonsoft.Json;

namespace NailsTcsoft3.Middleware
{
    public class ClaimRequirementFilter : IAsyncAuthorizationFilter
    {
        private readonly PermissionAction _permissionAction;

        public ClaimRequirementFilter(PermissionAction permissionAction)
        {
            _permissionAction = permissionAction;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var permissionsClaim = context.HttpContext.User.Claims.SingleOrDefault(c => c.Type == "Action");

            List<string> userActions = new List<string>();

            if (permissionsClaim != null)
            {
                try
                {
                    userActions = JsonConvert.DeserializeObject<List<string>>(permissionsClaim.Value);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Deserialize Error: " + ex.Message);
                }
            }

            if (userActions == null || !userActions.Contains(_permissionAction.ToString(), StringComparer.OrdinalIgnoreCase))
            {
                context.HttpContext.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.HttpContext.Response.ContentType = "application/json";

                await context.HttpContext.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = "Bạn không có quyền truy cập",
                    data = userActions
                });

                context.Result = new Microsoft.AspNetCore.Mvc.EmptyResult();
            }
        }

    }
}
