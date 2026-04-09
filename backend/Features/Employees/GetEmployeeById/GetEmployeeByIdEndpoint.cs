namespace backend.Features.Employees.GetEmployeeById
{
    public static class GetEmployeeByIdEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapGet("/{id:int}", async ([FromServices] IMediator mediator, [FromRoute] int id) =>
            {
                var command = new GetEmployeeByIdQuery(id);
                var result = await mediator.Send(command);
                return Results.Ok(ApiResponse<Employee>.SuccessResponse(result, "Employee retrieved successfully"));
            })
            .WithName("GetEmployeeById")
            .WithTags("Employees")
            .DocumentApiResponse<Employee>(
                "Get employee by id",
                "Returns a single employee by their id."
            );
        }
    }
}

