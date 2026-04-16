namespace backend.Domain.Models
{
    public class SystemSettings : BaseEntity
    {
        public int WorkLogGracePeriodDays { get; set; } = 7;
        public TimeSpan ReminderTime { get; set; } = new TimeSpan(10, 0, 0);
        public bool IsReminderEnabled { get; set; } = false;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
