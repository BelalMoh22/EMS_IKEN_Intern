namespace backend.Features.Attendance.Sync
{
    public static class SyncAttendanceEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder group)
        {
            return group.MapPost("/sync", async ([FromServices] IMediator mediator) =>
            {
                var command = new SyncAttendanceCommand();
                var result = await mediator.Send(command);

                return Results.Ok(ApiResponse<SyncResultDto>.SuccessResponse(result, "Sync completed successfully."));
            }).WithName("SyncAttendance").WithTags("Attendance").DisableAntiforgery()
            .DocumentApiResponse<SyncResultDto>(
                "Sync attendance",
                "Synchronizes/imports attendance records from the configured source."
            );
        }
    }
}

