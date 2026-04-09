namespace backend.Features.TimeTrack.WorkLogs.GetDailyLogs
{
    public static class GetDailyLogsEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapGet("/", async ([FromServices] IMediator mediator) =>
            {
                var query = new GetDailyLogsQuery();
                var result = await mediator.Send(query);

                return Results.Ok(ApiResponse<IEnumerable<DailyWorkLogDTO>>.SuccessResponse(result, "Daily work logs retrieved successfully"));
            }).WithName("GetDailyWorkLogs").WithTags("WorkLogs").RequireAuthorization();
        }
    }
}
