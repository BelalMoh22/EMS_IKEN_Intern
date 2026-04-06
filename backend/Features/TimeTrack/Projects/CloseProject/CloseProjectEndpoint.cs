namespace backend.Features.TimeTrack.Projects.CloseProject
{
    public static class CloseProjectEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder group)
        {
            group.MapPut("/{id}/close", async (int id, IMediator mediator) =>
            {
                var command = new CloseProjectCommand(id);

                await mediator.Send(command);

                return Results.Ok(new
                {
                    Message = "Project closed successfully"
                });
            }).WithName("CloseProject").WithTags("Projects").RequireAuthorization("ManagerTimeTrack");

            return group;
        }
    }
}
