namespace backend.Features.TimeTrack.WorkLogs.DeleteProjectLogs
{
    public static class DeleteProjectLogsEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapDelete("/project/{projectId:int}", async ([FromServices] IMediator mediator, [FromRoute] int projectId) =>
            {
                var command = new DeleteProjectLogsCommand(projectId);
                var result = await mediator.Send(command);

                return Results.Ok(ApiResponse<bool>.SuccessResponse(result, "Project removed from daily work log successfully"));
            })
            .WithName("DeleteProjectLogs")
            .WithTags("WorkLogs")
            .RequireAuthorization()
            .DocumentApiResponse<bool>(
                "Remove project from daily logs",
                "Deletes all daily work log entries for a given project in the daily context."
            );
        }
    }
}
