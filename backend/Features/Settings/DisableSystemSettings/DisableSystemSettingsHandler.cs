namespace backend.Features.Settings.DisableSystemSettings
{
    public class DisableSystemSettingsHandler : IRequestHandler<DisableSystemSettingsCommand, bool>
    {
        private readonly ISystemSettingsRepository _repo;

        public DisableSystemSettingsHandler(ISystemSettingsRepository repo)
        {
            _repo = repo;
        }

        public async Task<bool> Handle(DisableSystemSettingsCommand request, CancellationToken cancellationToken)
        {
            var settings = await _repo.GetSystemSettingsAsync();
            settings.IsDeleted = true;
            await _repo.UpdateSystemSettingsAsync(settings);
            return true;
        }
    }
}
