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
            if (request.WorkLogGracePeriod < 0)
                throw new Exception("Grace period cannot be negative.");

            await _repo.UpdateWorkLogGracePeriodAsync(request.WorkLogGracePeriod);
            return true;
        }
    }
}
