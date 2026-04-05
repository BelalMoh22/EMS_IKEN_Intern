namespace backend.Features.Attendance.Details
{
    public static class GetAttendanceDetailsEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(RouteGroupBuilder group)
        {
            group.MapGet("/details", async (
                int? employeeId,
                int? year,
                int? month,
                int? day,
                IMediator mediator) =>
            {
                var command = new GetAttendanceDetailsQuery(employeeId, year, month, day);
                var results = await mediator.Send(command);
                return Results.Ok(ApiResponse<List<AttendanceRecordDto>>.SuccessResponse(results));
            }).WithName("GetAttendanceDetails").WithTags("Attendance");

            return group;
        }
    }
}
