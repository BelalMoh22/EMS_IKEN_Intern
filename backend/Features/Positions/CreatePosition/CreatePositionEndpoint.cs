namespace backend.Features.Positions.CreatePosition
{
    public static class CreatePositionEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapPost("/", async ([FromBody] CreatePositionDto dto, [FromServices] IMediator mediator) =>
            {
                var command = new CreatePositionCommand(dto);
                var id = await mediator.Send(command);

                var response = ApiResponse<int>.SuccessResponse(id, "Position created successfully");

                return Results.Created($"/position/{id}", response);
            })
            .WithName("CreatePosition")
            .WithTags("Positions")
            .DocumentJsonRequest<CreatePositionDto>(new { positionName = "HR Specialist", minSalary = 5000, maxSalary = 9000, departmentId = 1, targetEmployeeCount = 3 })
            .WithSummary("Create position")
            .WithDescription("Creates a new position under a department.")
            .Produces<ApiResponse<int>>(StatusCodes.Status201Created, contentType: "application/json")
            .Produces<ApiResponse<string>>(StatusCodes.Status400BadRequest, contentType: "application/json")
            .Produces<ApiResponse<string>>(StatusCodes.Status500InternalServerError, contentType: "application/json")
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
        }
    }
}

