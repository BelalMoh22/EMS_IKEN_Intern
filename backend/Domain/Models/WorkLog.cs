namespace backend.Domain.Models
{
    public class WorkLog : BaseEntity
    {
        public int EmployeeId { get; set; }
        public int ProjectId { get; set; }

        public DateTime WorkDate { get; set; }

        public decimal Hours { get; set; }

        public WorkStatus Status { get; set; }

        public string? Notes { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
