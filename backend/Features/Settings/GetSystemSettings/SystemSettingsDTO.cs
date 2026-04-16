namespace backend.Features.Settings.GetSystemSettings
{
    public class SystemSettingsDTO
    {
        public int WorkLogGracePeriodDays { get; set; }
        public string ReminderTime { get; set; } = string.Empty;
        public bool IsReminderEnabled { get; set; }
        public bool IsDeleted { get; set; }
    }
}
