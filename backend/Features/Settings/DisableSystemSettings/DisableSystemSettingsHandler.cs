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
            await _repo.DisableGracePeriodAsync();
            return true;
        }
    }
}
