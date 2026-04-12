namespace backend.Features.Settings.UpdateSystemSettings
{
    public class UpdateSystemSettingsHandler : IRequestHandler<UpdateSystemSettingsCommand, bool>
    {
        private readonly ISystemSettingsRepository _repo;

        public UpdateSystemSettingsHandler(ISystemSettingsRepository repo)
        {
            _repo = repo;
        }

        public async Task<bool> Handle(UpdateSystemSettingsCommand request, CancellationToken cancellationToken)
        {
            if (request.WorkLogGracePeriod < 1)
                throw new Exception("Grace period must be at least 1 day.");

            await _repo.UpdateWorkLogGracePeriodAsync(request.WorkLogGracePeriod);
            return true;
        }
    }
}
