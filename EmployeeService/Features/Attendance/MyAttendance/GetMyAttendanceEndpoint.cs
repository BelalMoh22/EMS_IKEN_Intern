namespace EmployeeService.Features.Attendance.MyAttendance
{
    public static class GetMyAttendanceEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder group)
        {
            group.MapGet("/my", async (
                HttpContext httpContext,
                [FromQuery] int? year,
                [FromQuery] int? month,
                [FromQuery] int? day,
                [FromServices] IMediator mediator) =>
            {
                var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? httpContext.User.FindFirst("sub")?.Value;

                if (userIdClaim is null || !int.TryParse(userIdClaim, out int userId))
                    return Results.Unauthorized();

                var query = new GetMyAttendanceQuery(userId, year, month, day);
                var result = await mediator.Send(query);

                return Results.Ok(
                    ApiResponse<MyAttendanceResultDto>.SuccessResponse(
                        result, "Attendance records fetched successfully."));
            })
            .WithName("GetMyAttendance")
            .WithTags("Attendance")
            .RequireAuthorization();

            return group;
        }
    }
}
