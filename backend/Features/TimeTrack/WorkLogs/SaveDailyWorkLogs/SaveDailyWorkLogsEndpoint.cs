namespace backend.Features.TimeTrack.WorkLogs.SaveDailyWorkLogs
{
    public static class SaveDailyWorkLogsEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapPost("/", async ([FromServices] IMediator mediator, [FromBody] CreateUpdateDailyWorkLogsDTO dto) =>
            {
                var command = new SaveDailyWorkLogsCommand(dto);
                await mediator.Send(command);

                return Results.Ok(ApiResponse<bool>.SuccessResponse(true, "Work logs saved successfully"));
            }).WithName("SaveDailyWorkLogs").WithTags("WorkLogs").RequireAuthorization();
        }
    }
}
