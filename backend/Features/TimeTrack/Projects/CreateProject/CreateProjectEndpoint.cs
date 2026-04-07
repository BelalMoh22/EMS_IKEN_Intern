namespace backend.Features.TimeTrack.Projects.CreateProject
{
    public static class CreateProjectEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder group)
        {
            group.MapPost("/", async (CreateProjectDTO dto, IMediator mediator) =>
            {
                var command = new CreateProjectCommand(dto);

                var id = await mediator.Send(command);

                return Results.Created($"/projects/{id}", new
                {
                    Id = id,
                    Message = "Project created successfully"
                });
            }).WithName("CreateProject").WithTags("Projects");

            return group;
        }
    }
}
