namespace backend.Features.Attendance.MonthlySummary
{
    public static class GetMonthlySummaryEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(RouteGroupBuilder group)
        {
            group.MapGet("/monthly", async (int? year, int? month, IMediator mediator) =>
            {
                var command = new GetMonthlySummaryQuery(year, month);
                var results = await mediator.Send(command);

                return Results.Ok(ApiResponse<List<EmployeeMonthlyAttendanceDto>>.SuccessResponse(results));
            }).WithName("GetMonthlyAttendanceSummary").WithTags("Attendance");

            return group;
        }
    }
}
