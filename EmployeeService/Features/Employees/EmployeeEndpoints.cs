namespace EmployeeService.Features.Employees
{
    public static class EmployeesEndpoints
    {
        public static RouteGroupBuilder MapEmployeesEndpoints(this RouteGroupBuilder group)
        {
            CreateEmployeeEndPoint.MapEndpoint(group);
            UpdateEmployeeEndPoint.MapEndpoint(group);
            DeleteEmployeeEndPoint.MapEndpoint(group);
            GetEmployeesEndpoint.MapEndpoint(group);
            GetEmployeeByIdEndpoint.MapEndpoint(group);
            GetEmployeeByUserIdEndpoint.MapEndpoint(group);

            return group;
        }
    }
}
