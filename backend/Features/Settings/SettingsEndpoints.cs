using backend.Features.Settings.GetSystemSettings;
using backend.Features.Settings.UpdateSystemSettings;

namespace backend.Features.Settings
{
    public static class SettingsEndpoints
    {
        public static void MapSettingsEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGetSystemSettings();
            app.MapUpdateSystemSettings();
        }
    }
}
