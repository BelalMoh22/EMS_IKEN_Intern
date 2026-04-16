namespace backend.Features.Settings.UpdateSystemSettings
{
    public class UpdateSystemSettingsDTO
    {
        public int WorkLogGracePeriodDays { get; set; }
        public string ReminderTime { get; set; } = string.Empty;
        public bool IsReminderEnabled { get; set; }
    }
}
