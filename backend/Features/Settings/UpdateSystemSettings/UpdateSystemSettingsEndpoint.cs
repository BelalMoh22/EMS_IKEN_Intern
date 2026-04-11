namespace backend.Features.Settings.UpdateSystemSettings
{
    public static class UpdateSystemSettingsEndpoint
    {
        public static void MapUpdateSystemSettings(this IEndpointRouteBuilder app)
        {
            app.MapPut("/", async (UpdateSystemSettingsDTO dto, IMediator mediator) =>
            {
                var result = await mediator.Send(new UpdateSystemSettingsCommand(dto.WorkLogGracePeriod));
                return Results.Ok(new { message = "Settings updated successfully", success = result });
            })
            .WithName("UpdateSystemSettings")
            .WithTags("Settings")
            .RequireAuthorization("ManagerTimeTrack"); // Restrict to Managers
        }
    }
}
