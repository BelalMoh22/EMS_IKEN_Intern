namespace backend.Features.Attendance.MonthlySummary
{
    public static class GetMonthlySummaryEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(RouteGroupBuilder group)
        {
            return group.MapGet("/monthly", async (int? year, int? month, [FromServices] IMediator mediator) =>
            {
                var command = new GetMonthlySummaryQuery(year, month);
                var results = await mediator.Send(command);

                return Results.Ok(ApiResponse<List<EmployeeMonthlyAttendanceDto>>.SuccessResponse(results));
            }).WithName("GetMonthlyAttendanceSummary").WithTags("Attendance");
        }
    }
}

