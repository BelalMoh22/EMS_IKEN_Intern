namespace backend.Features.TimeTrack.WorkLogs.GetMonthlyLogs
{
    public static class GetMonthlyLogsEndpoint
    {
        public static void MapEndpoint(RouteGroupBuilder group)
        {
            group.MapGet("/month", async (
                [AsParameters] GetMonthlyLogsQuery query,
                IMediator mediator) =>
            {
                var result = await mediator.Send(query);
                return Results.Ok(ApiResponse<IEnumerable<MonthlyWorkLogDTO>>.SuccessResponse(result, "Monthly logs retrieved."));
            })
            .RequireAuthorization()
            .WithTags("WorkLogs")
            .DocumentApiResponse<IEnumerable<MonthlyWorkLogDTO>>(
                "Get monthly work logs",
                "Returns all work logs for the current employee for a given month.");
        }
    }
}
