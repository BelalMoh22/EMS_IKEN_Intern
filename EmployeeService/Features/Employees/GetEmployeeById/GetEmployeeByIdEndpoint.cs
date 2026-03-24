namespace EmployeeService.Features.Employees.GetEmployeeById
{
    public static class GetEmployeeByIdEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapGet("/{id:int}", async ([FromServices] IMediator mediator, [FromRoute]int id) =>
            {
                var command = new GetEmployeeByIdQuery(id);
                var result = await mediator.Send(command);
                return Results.Ok(ApiResponse<Employee>.SuccessResponse(result, "Employee retrieved successfully"));
            }).WithName("GetEmployeeById").WithTags("Employees").RequireAuthorization("EmployeesReadOnly");

            return app;
        }
    }
}
