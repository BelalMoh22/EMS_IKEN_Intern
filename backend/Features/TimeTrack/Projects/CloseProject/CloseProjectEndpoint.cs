namespace backend.Features.TimeTrack.Projects.CloseProject
{
    public static class CloseProjectEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder group)
        {
            return group.MapPut("/{id}/complete", async (int id, IMediator mediator) =>
            {
                var command = new CloseProjectCommand(id);

                await mediator.Send(command);

                return Results.Ok(new
                {
                    Message = "Project completed successfully"
                });
            }).WithName("CompleteProject").WithTags("Projects")
            .WithSummary("Complete project")
            .WithDescription("Completes a project to prevent further work logging.")
            .Produces(StatusCodes.Status200OK)
            .Produces<ApiResponse<string>>(StatusCodes.Status400BadRequest, contentType: "application/json")
            .Produces<ApiResponse<string>>(StatusCodes.Status404NotFound, contentType: "application/json")
            .Produces<ApiResponse<string>>(StatusCodes.Status500InternalServerError, contentType: "application/json")
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
        }
    }
}
