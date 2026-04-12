namespace backend.Features.TimeTrack.WorkLogs.GetReport
{
    public static class GetWorkLogsReportEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder group)
        {
            return group.MapGet("/report", async (
                HttpContext httpContext,
                [FromServices] IMediator mediator, 
                [FromQuery] DateTime startDate, 
                [FromQuery] DateTime endDate) =>
            {
                var roleClaim = httpContext.User.FindFirst(ClaimTypes.Role)?.Value;
                var query = new GetWorkLogsReportQuery(startDate, endDate, roleClaim ?? "");
                var result = await mediator.Send(query);
                return Results.Ok(ApiResponse<IEnumerable<WorkLogReportDto>>.SuccessResponse(result, "Report data retrieved successfully"));
            })
            .WithName("GetWorkLogsReport")
            .WithTags("WorkLogs")
            .RequireAuthorization("ManagerTimeTrack")
            .DocumentApiResponse<IEnumerable<WorkLogReportDto>>(
                "Get work logs report", 
                "Returns a matrix report style data of employee vs projects within a date range.");
        }
    }
}
