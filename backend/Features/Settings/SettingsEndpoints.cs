namespace backend.Features.Settings
{
    public static class SettingsEndpoints
    {
        public static void MapSettingsEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGetSystemSettings();
            app.MapUpdateSystemSettings();
            app.MapDisableSystemSettings();
        }
    }
}
