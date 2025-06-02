using NailsTcsoft3.Models.Enum;

namespace NailsTcsoft3.Middleware
{
    public class PermissionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly Dictionary<string, PermissionAction> _routePermissionMap;

        public PermissionMiddleware(RequestDelegate next)
        {
            _next = next;

            // Ánh xạ URL tới permission tương ứng
            _routePermissionMap = new Dictionary<string, PermissionAction>(StringComparer.OrdinalIgnoreCase)
            {
                ["/customer/addcustomer"] = PermissionAction.CUSTOMER_ADD,
                ["/customer/editcustomer"] = PermissionAction.CUSTOMER_EDIT,
                ["/customer/deletecustomer"] = PermissionAction.CUSTOMER_DELETE,
                ["/customer/deletemultiplecustomers"] = PermissionAction.CUSTOMER_DELETE,
                ["/customer/searchcustomer"] = PermissionAction.CUSTOMER_SEARCH,
                ["/customer/exportcustomer"] = PermissionAction.CUSTOMER_EXPORT,
                ["/customer/addcustomers"] = PermissionAction.CUSTOMER_ADD,
                ["/customer"] = PermissionAction.CUSTOMER_VIEW,

                ["/staff/addstaffs"] = PermissionAction.STAFF_ADD,
                ["/staff/updatestaff"] = PermissionAction.STAFF_EDIT,
                ["/staff/deletestaff"] = PermissionAction.STAFF_DELETE,
                ["/staff/searchstaff"] = PermissionAction.STAFF_SEARCH,
                ["/staff/exportstaff"] = PermissionAction.STAFF_EXPORT,
                ["/staff/getall"] = PermissionAction.STAFF_VIEW,

                ["/workdate/createcalendar"] = PermissionAction.WORKDATE_ADD,
                ["/workdate/deletecalendar"] = PermissionAction.WORKDATE_DELETE,
                ["/workdate/getworkdate"] = PermissionAction.WORKDATE_VIEW,

                ["/appointment/addappointment"] = PermissionAction.APPOINTMENT_ADD,
                ["/appointment/updateappointment"] = PermissionAction.APPOINTMENT_EDIT,
                ["/appointment/deleteappointment"] = PermissionAction.APPOINTMENT_DELETE,
                ["/appointment/getappointment"] = PermissionAction.APPOINTMENT_VIEW,

                ["/permission/createrole"] = PermissionAction.ROLE_ADD,
                ["/permission/updaterole"] = PermissionAction.ROLE_EDIT,
                ["/permission/deleterole"] = PermissionAction.ROLE_DELETE,
                ["/permission/updateroleforuser"] = PermissionAction.ROLE_UPDATEFORUSER,
                ["/permission"] = PermissionAction.ROLE_VIEW,

                ["/goodsreceipts/create"] = PermissionAction.GOODSRECEIPT_ADD,
                ["/goodsreceipts/update"] = PermissionAction.GOODSRECEIPT_EDIT,
                ["/goodsreceipts/delete"] = PermissionAction.GOODSRECEIPT_DELETE,
                ["/goodsreceipts/deleteall"] = PermissionAction.GOODSRECEIPT_DELETE,
                ["/goodsreceipts/getbyfilter"] = PermissionAction.GOODSRECEIPT_SEARCH,
                ["/goodsreceipts/getall"] = PermissionAction.GOODSRECEIPT_VIEW,

                ["/product/postproduct"] = PermissionAction.PRODUCT_ADD,
                ["/product/postcombo"] = PermissionAction.PRODUCT_ADD,
                ["/product/putproduct"] = PermissionAction.PRODUCT_EDIT,
                ["/product/putcombo"] = PermissionAction.PRODUCT_EDIT,
                ["/product/deleteproduct"] = PermissionAction.PRODUCT_DELETE,
                ["/product/deletemultipleproducts"] = PermissionAction.PRODUCT_DELETE,
                ["/product/getbyfilter"] = PermissionAction.PRODUCT_SEARCH,
                ["/product"] = PermissionAction.PRODUCT_VIEW,

                ["/bill/createnewbill"] = PermissionAction.BILL_ADD,
                ["/bill/updatebill"] = PermissionAction.BILL_EDIT,
                ["/bill/updatemultiplebills"] = PermissionAction.BILL_EDIT,
                ["/bill/delete"] = PermissionAction.BILL_DELETE,
                ["/bill/filterbill"] = PermissionAction.BILL_SEARCH,
                ["/bill/getall"] = PermissionAction.BILL_VIEW,


            };
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.ToString().ToLower();

            var matched = _routePermissionMap.FirstOrDefault(m => path.Contains(m.Key));

            if (!matched.Equals(default(KeyValuePair<string, PermissionAction>)))
            {
                string requiredClaim = matched.Value.ToString().Replace('_', ':');

                var userActions = context.User.Claims
                    .Where(c => c.Type == "Action")
                    .Select(c => c.Value)
                    .ToList();
                var actionClaim = context.User.FindFirst("Action")?.Value;

                List<string> actions = new List<string>();


                // DEBUG: Log tất cả claim "Action"
                Console.WriteLine("User 'Action' claims:");
                foreach (var action in userActions)
                {
                    Console.WriteLine($" - {action}");
                }

                if (!userActions.Any())
                {
                    Console.WriteLine("No 'Action' claims found.");
                }

                if (!userActions.Contains(requiredClaim, StringComparer.OrdinalIgnoreCase))
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsJsonAsync(new
                    {
                        success = false,
                        message = $"Bạn không có quyền truy cập",
                        data = userActions
                    });
                    return;
                }
            }

            await _next(context);
        }

    }

}
