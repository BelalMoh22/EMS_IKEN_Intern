namespace EmployeeService.Features.Attendance.Confirm
{
    public static class ConfirmAttendanceEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder group)
        {
            group.MapPost("/confirm", async (
                [FromBody] List<AttendancePreviewDto> rows,
                [FromServices] IMediator mediator) =>
            {
                if (rows is null || rows.Count == 0)
                    return Results.BadRequest(
                        ApiResponse<string>.FailureResponse(
                            new() { { "rows", ["No rows were provided."] } },
                            "Confirm failed"));

                var command = new ConfirmAttendanceCommand(rows);
                var saved = await mediator.Send(command);

                return Results.Ok(
                    ApiResponse<int>.SuccessResponse(
                        saved, $"{saved} attendance record(s) saved successfully."));
            })
            .WithName("ConfirmAttendance")
            .WithTags("Attendance")
            .RequireAuthorization("FullCRUD");

            return group;
        }
    }
}
