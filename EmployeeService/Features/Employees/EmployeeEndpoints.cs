namespace EmployeeService.Features.Employees
{
    public static class EmployeesEndpoints
    {
        public static RouteGroupBuilder MapEmployeesEndpoints(this RouteGroupBuilder app)
        {
            GetEmployeesEndpoint.MapEndpoint(app);
            GetEmployeeByIdEndpoint.MapEndpoint(app);
            CreateEmployeeEndPoint.MapEndpoint(app);
            UpdateEmployeeEndPoint.MapEndpoint(app);
            DeleteEmployeeEndPoint.MapEndpoint(app);

            return app;
        }
    }
}
