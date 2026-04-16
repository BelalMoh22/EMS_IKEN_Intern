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
            if (request.WorkLogGracePeriodDays < 0)
                throw new Exception("Grace period cannot be negative.");

            if (!TimeSpan.TryParse(request.ReminderTime, out var reminderTime))
                throw new Exception("Invalid Reminder Time format. Use HH:mm");

            var settings = new SystemSettings
            {
                WorkLogGracePeriodDays = request.WorkLogGracePeriodDays,
                ReminderTime = reminderTime,
                IsReminderEnabled = request.IsReminderEnabled
            };

            await _repo.UpdateSystemSettingsAsync(settings);
            
            // Re-schedule Hangfire Job
            Program.UpdateWorkLogReminderJob(settings);
            
            return true;
        }
    }
}
