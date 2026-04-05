namespace backend.Domain.Models
{
    public class Attendance : BaseEntity
    {
        public int EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        public DateTime Date { get; set; }

        public TimeSpan? CheckIn { get; set; }
        public TimeSpan? CheckOut { get; set; }

        public int LateMinutes { get; set; }
        public int EarlyLeaveMinutes { get; set; }
        public int WorkingMinutes { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
