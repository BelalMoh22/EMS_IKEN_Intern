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
            })
            .WithName("SaveDailyWorkLogs")
            .WithTags("WorkLogs")
            .RequireAuthorization()
            .DocumentJsonRequest<CreateUpdateDailyWorkLogsDTO>(new
            {
                workDate = "2026-03-24",
                logs = new[]
                {
                    new { projectId = 1, hours = 2.5, status = "InProgress", notes = "Standup + planning" },
                    new { projectId = 2, hours = 5.0, status = "Completed", notes = "Implemented feature X" }
                }
            })
            .DocumentApiResponse<bool>(
                "Save daily work logs",
                "Creates/updates the set of work logs for the day based on the submitted payload."
            );
        }
    }
}
