namespace backend.Features.Employees
{
    public static class EmployeesEndpoints
    {
        public static RouteGroupBuilder MapEmployeesEndpoints(this RouteGroupBuilder group)
        {
            CreateEmployeeEndPoint.MapEndpoint(group).RequireAuthorization("FullCRUD");
            UpdateEmployeeEndPoint.MapEndpoint(group).RequireAuthorization("FullCRUD");
            DeleteEmployeeEndPoint.MapEndpoint(group).RequireAuthorization("FullCRUD");
            GetEmployeesEndpoint.MapEndpoint(group).RequireAuthorization("ReadResource");
            GetEmployeeByIdEndpoint.MapEndpoint(group).RequireAuthorization("ReadResource");
            GetEmployeeByUserIdEndpoint.MapEndpoint(group).RequireAuthorization();

            return group;
        }
    }
}
