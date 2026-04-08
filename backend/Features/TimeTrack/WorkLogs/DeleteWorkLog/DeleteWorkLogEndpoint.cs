namespace backend.Features.TimeTrack.WorkLogs.DeleteWorkLog
{
    public static class DeleteWorkLogEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapDelete("/worklogs/{id:int}", async ([FromRoute] int id, [FromServices] IMediator mediator) =>
            {
                var command = new DeleteWorkLogCommand(id);

                var result = await mediator.Send(command);

                return Results.Ok(
                   ApiResponse<bool>.SuccessResponse(result, "Work log deleted successfully")
                );
            }).WithName("DeleteWorkLog").WithTags("WorkLogs");
        }
    }
}
