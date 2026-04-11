using MediatR;

namespace backend.Features.Settings.GetSystemSettings
{
    public class GetSystemSettingsQuery : IRequest<SystemSettingsDTO>
    {
    }
}
