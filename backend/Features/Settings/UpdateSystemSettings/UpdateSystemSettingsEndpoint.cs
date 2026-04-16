namespace backend.Features.Settings.UpdateSystemSettings
{
    public static class UpdateSystemSettingsEndpoint
    {
        public static void MapUpdateSystemSettings(this IEndpointRouteBuilder app)
        {
            app.MapPut("/", async (UpdateSystemSettingsDTO dto, IMediator mediator) =>
            {
                var result = await mediator.Send(new UpdateSystemSettingsCommand(dto.WorkLogGracePeriodDays, dto.ReminderTime, dto.IsReminderEnabled));
                return Results.Ok(ApiResponse<bool>.SuccessResponse(result, "Settings updated successfully"));
            })
            .WithName("UpdateSystemSettings")
            .WithTags("Settings")
            .RequireAuthorization("ManagerTimeTrack");
        }
    }
}
