namespace backend.Features.Attendance.MyAttendance
{
    public static class GetMyAttendanceEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder group)
        {
            return group.MapGet("/my", async (HttpContext httpContext, [FromQuery] int? year, [FromQuery] int? month, [FromQuery] int? day,[FromServices] IMediator mediator) =>
            {
                var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? httpContext.User.FindFirst("sub")?.Value;

                if (userIdClaim is null || !int.TryParse(userIdClaim, out int userId))
                    return Results.Unauthorized();

                var command = new GetMyAttendanceQuery(userId, year, month, day);
                var result = await mediator.Send(command);

                return Results.Ok(ApiResponse<MyAttendanceResultDto>.SuccessResponse(result, "Attendance records fetched successfully."));
            }).WithName("GetMyAttendance").WithTags("Attendance")
            .DocumentApiResponse<MyAttendanceResultDto>(
                "Get my attendance",
                "Returns the current user's attendance records with optional year/month/day filtering."
            );
        }
    }
}

