namespace backend.Features.Settings.GetSystemSettings
{
    public class GetSystemSettingsHandler : IRequestHandler<GetSystemSettingsQuery, SystemSettingsDTO>
    {
        private readonly ISystemSettingsRepository _repo;

        public GetSystemSettingsHandler(ISystemSettingsRepository repo)
        {
            _repo = repo;
        }

        public async Task<SystemSettingsDTO> Handle(GetSystemSettingsQuery request, CancellationToken cancellationToken)
        {
            var settings = await _repo.GetSystemSettingsAsync();

            return new SystemSettingsDTO
            {
                WorkLogGracePeriodDays = settings.WorkLogGracePeriodDays,
                ReminderTime = settings.ReminderTime.ToString(@"hh\:mm"),
                IsReminderEnabled = settings.IsReminderEnabled,
                IsDeleted = settings.IsDeleted
            };
        }
    }
}
