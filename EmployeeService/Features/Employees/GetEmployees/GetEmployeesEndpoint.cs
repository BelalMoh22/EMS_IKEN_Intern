namespace EmployeeService.Features.Employees.GetEmployees
{
    public static class GetEmployeesEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapGet("/", async ([FromServices] IMediator mediator) =>
            {
                var command = new GetEmployeesQuery();
                var result = await mediator.Send(command);
                return Results.Ok(ApiResponse<IEnumerable<Employee>>.SuccessResponse(result, "Employees retrieved successfully"));
            }).WithName("GetEmployees").WithTags("Employees").RequireAuthorization("EmployeesReadOnly");

            return app;
        }
    }
}
