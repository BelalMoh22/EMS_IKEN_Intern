namespace backend.Features.Settings.DisableSystemSettings
{
    public static class DisableSystemSettingsEndpoint
    {
        public static void MapDisableSystemSettings(this IEndpointRouteBuilder app)
        {
            app.MapDelete("/", async (IMediator mediator) =>
            {
                var result = await mediator.Send(new DisableSystemSettingsCommand());
                return Results.Ok(ApiResponse<bool>.SuccessResponse(result, "Work log grace period disabled successfully"));
            })
            .WithName("DisableSystemSettings")
            .WithTags("Settings")
            .RequireAuthorization("ManagerTimeTrack");
        }
    }
}
