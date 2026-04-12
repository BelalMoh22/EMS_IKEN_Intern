using backend.Domain.Common;

namespace backend.Features.Settings.GetSystemSettings
{
    public static class GetSystemSettingsEndpoint
    {
        public static void MapGetSystemSettings(this IEndpointRouteBuilder app)
        {
            app.MapGet("/", async (IMediator mediator) =>
            {
                var result = await mediator.Send(new GetSystemSettingsQuery());
                return Results.Ok(ApiResponse<SystemSettingsDTO>.SuccessResponse(result, "Settings retrieved successfully"));
            })
            .WithName("GetSystemSettings")
            .WithTags("Settings")
            .RequireAuthorization();
        }
    }
}
