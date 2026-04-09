namespace backend.Features.TimeTrack.Projects.CreateProject
{
    public static class CreateProjectEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder group)
        {
            return group.MapPost("/", async (CreateProjectDTO dto, IMediator mediator) =>
            {
                var command = new CreateProjectCommand(dto);

                var id = await mediator.Send(command);

                return Results.Created($"/projects/{id}", new
                {
                    Id = id,
                    Message = "Project created successfully"
                });
            })
            .WithName("CreateProject")
            .WithTags("Projects")
            .DocumentJsonRequest<CreateProjectDTO>(new { name = "HR Revamp", description = "Improve HR flows and approvals" })
            .WithSummary("Create project")
            .WithDescription("Creates a new project for time tracking.")
            .Produces(StatusCodes.Status201Created)
            .Produces<ApiResponse<string>>(StatusCodes.Status400BadRequest, contentType: "application/json")
            .Produces<ApiResponse<string>>(StatusCodes.Status500InternalServerError, contentType: "application/json")
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
        }
    }
}
