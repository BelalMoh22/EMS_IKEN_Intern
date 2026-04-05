namespace backend.Features.Attendance.Sync
{
    public static class SyncAttendanceEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder group)
        {
            group.MapPost("/sync", async ([FromServices] IMediator mediator) =>
            {
                var command = new SyncAttendanceCommand();
                var result = await mediator.Send(command);

                return Results.Ok(ApiResponse<SyncResultDto>.SuccessResponse(result, "Sync completed successfully."));
            }).WithName("SyncAttendance").WithTags("Attendance").DisableAntiforgery();

            return group;
        }
    }
}
