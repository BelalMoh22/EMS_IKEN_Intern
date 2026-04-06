namespace backend.Features.Departments
{
    public static class DepartmentEndpoints
    {
        public static RouteGroupBuilder MapDepartmentEndpoints(this RouteGroupBuilder group)
        {
            GetDepartmentsEndpoint.MapEndpoint(group).RequireAuthorization("ReadResource");
            GetDepartmentByIdEndpoint.MapEndpoint(group).RequireAuthorization("ReadResource");
            CreateDepartmentEndpoint.MapEndpoint(group).RequireAuthorization("FullCRUD");
            UpdateDepartmentEndpoint.MapEndpoint(group).RequireAuthorization("FullCRUD"); 
            DeleteDepartmentEndpoint.MapEndpoint(group).RequireAuthorization("FullCRUD");

            //group.RequireAuthorization(policy => policy.RequireRole("HR"));
            return group;
        }
    }
}
