namespace backend.Features.Attendance.Details
{
    public static class GetAttendanceDetailsEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(RouteGroupBuilder group)
        {
            return group.MapGet("/details", async (
                int? employeeId,
                int? year,
                int? month,
                int? day,
                [FromServices] IMediator mediator) =>
            {
                var command = new GetAttendanceDetailsQuery(employeeId, year, month, day);
                var results = await mediator.Send(command);
                return Results.Ok(ApiResponse<List<AttendanceRecordDto>>.SuccessResponse(results));
            }).WithName("GetAttendanceDetails").WithTags("Attendance")
            .DocumentApiResponse<List<AttendanceRecordDto>>(
                "Get attendance details",
                "Returns attendance details filtered by employeeId/year/month/day (optional)."
            );
        }
    }
}

