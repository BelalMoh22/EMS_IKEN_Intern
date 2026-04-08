namespace backend.Features.TimeTrack.WorkLogs.GetDailyLogDetails
{
    public static class GetDailyLogDetailsEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapGet("/details/{date:datetime}", async ([FromServices] IMediator mediator, [FromRoute] DateTime date) =>
            {
                var query = new GetDailyLogDetailsQuery(date);
                var result = await mediator.Send(query);

                return Results.Ok(ApiResponse<DailyWorkLogDetailsDTO>.SuccessResponse(result, "Work log details retrieved successfully"));
            }).WithName("GetDailyLogDetails").WithTags("WorkLogs").RequireAuthorization();
        }
    }
}
