namespace backend.Features.Departments.GetDepartmentById
{
    public static class GetDepartmentByIdEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapGet("/{id:int}", async ([FromServices] IMediator mediator, [FromRoute] int id) =>
            {
                var command = new GetDepartmentByIdQuery(id);
                var result = await mediator.Send(command);
                return Results.Ok(ApiResponse<Department>.SuccessResponse(result, "Department retrieved successfully"));
            })
            .WithName("GetDepartmentById")
            .WithTags("Departments")
            .DocumentApiResponse<Department>(
                "Get department by id",
                "Returns a single department by its id."
            );
        }
    }
}

