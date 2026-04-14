namespace backend.Features.TimeTrack.WorkLogs.SaveTimesheet
{
    public static class SaveTimesheetEndpoint
    {
        public static void MapEndpoint(RouteGroupBuilder group)
        {
            group.MapPost("/", async (SaveTimesheetDTO dto, IMediator mediator) =>
            {
                var result = await mediator.Send(new SaveTimesheetCommand(dto));
                return Results.Ok(ApiResponse<bool>.SuccessResponse(result, "Timesheet saved successfully."));
            })
            .RequireAuthorization()
            .WithTags("WorkLogs")
            .DocumentApiResponse<bool>(
                "Save timesheet changes",
                "Accepts changed cells and performs UPSERT for each entry.");
        }
    }
}
