namespace backend.Features.Departments.CreateDepartment
{
    public static class CreateDepartmentEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapPost("/", async ([FromBody] CreateDepartmentDto dto, [FromServices] IMediator mediator) =>
            {
                var command = new CreateDepartmentCommand(dto);
                var id = await mediator.Send(command);

                var response = ApiResponse<int>.SuccessResponse(id, "Department created successfully");

                return Results.Created($"/departments/{id}", response);
            }).WithName("CreateDepartment").WithTags("Departments")
            .DocumentJsonRequest<CreateDepartmentDto>(new { departmentName = "HR", description = "Human Resources", managerId = (int?)null })
            .WithSummary("Create department")
            .WithDescription("Creates a new department.")
            .Produces<ApiResponse<int>>(StatusCodes.Status201Created, contentType: "application/json")
            .Produces<ApiResponse<string>>(StatusCodes.Status400BadRequest, contentType: "application/json")
            .Produces<ApiResponse<string>>(StatusCodes.Status500InternalServerError, contentType: "application/json")
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        }
    }
}

