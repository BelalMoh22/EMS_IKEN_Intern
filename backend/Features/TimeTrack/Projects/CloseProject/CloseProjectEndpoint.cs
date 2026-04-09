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
            })
            .WithName("CloseProject")
            .WithTags("Projects")
            .WithSummary("Close project")
            .WithDescription("Closes a project to prevent further work logging.")
            .Produces(StatusCodes.Status200OK)
            .Produces<ApiResponse<string>>(StatusCodes.Status400BadRequest, contentType: "application/json")
            .Produces<ApiResponse<string>>(StatusCodes.Status404NotFound, contentType: "application/json")
            .Produces<ApiResponse<string>>(StatusCodes.Status500InternalServerError, contentType: "application/json")
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

            return group;
        }
    }
}
