namespace backend.Features.Departments.GetDepartmentById
{
    public static class GetDepartmentByIdEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapGet("/{id:int}", async ([FromServices] IMediator mediator, [FromRoute] int id) =>
            {
                var command = new GetDepartmentByIdQuery(id);
                var result = await mediator.Send(command);
                return Results.Ok(ApiResponse<Department>.SuccessResponse(result, "Department retrieved successfully"));
            }).WithName("GetDepartmentById").WithTags("Departments");

            return app;
        }
    }
}
