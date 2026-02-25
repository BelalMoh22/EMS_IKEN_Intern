namespace EmployeeService.Features.Departments
{
    public static class DepartmentEndpoints
    {
        public static RouteGroupBuilder MapDepartmentEndpoints(this RouteGroupBuilder group)
        {
            GetDepartmentsEndpoint.MapEndpoint(group);
            GetDepartmentByIdEndpoint.MapEndpoint(group);
            CreateDepartmentEndpoint.MapEndpoint(group);
            UpdateDepartmentEndpoint.MapEndpoint(group); 
            DeleteDepartmentEndpoint.MapEndpoint(group);

            return group;
        }
    }
}
