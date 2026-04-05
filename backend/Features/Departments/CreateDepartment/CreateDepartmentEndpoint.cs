namespace backend.Features.Departments.CreateDepartment
{
    public static class CreateDepartmentEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapPost("/", async ([FromBody] CreateDepartmentDto dto, [FromServices] IMediator mediator) =>
            {
                var command = new CreateDepartmentCommand(dto);
                var id = await mediator.Send(command);

                var response = ApiResponse<int>.SuccessResponse(id, "Department created successfully");

                return Results.Created($"/departments/{id}", response);
            }).WithName("CreateDepartment").WithTags("Departments");

            return app;

        }
    }
}
