namespace backend.Domain.Models
{
    public class SystemSettings : BaseEntity
    {
        public int WorkLogGracePeriod { get; set; } = 7;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
