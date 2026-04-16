namespace backend.Features.Settings.UpdateSystemSettings
{
    public class UpdateSystemSettingsCommand : IRequest<bool>
    {
        public int WorkLogGracePeriodDays { get; set; }
        public string ReminderTime { get; set; }
        public bool IsReminderEnabled { get; set; }

        public UpdateSystemSettingsCommand(int workLogGracePeriodDays, string reminderTime, bool isReminderEnabled)
        {
            WorkLogGracePeriodDays = workLogGracePeriodDays;
            ReminderTime = reminderTime;
            IsReminderEnabled = isReminderEnabled;
        }
    }
}
