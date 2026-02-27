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
                return Results.Ok(result);
            }).WithName("GetEmployees").WithTags("Employees");

            return app;
        }
    }
}
