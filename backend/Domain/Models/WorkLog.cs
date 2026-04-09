namespace backend.Domain.Models
{
    public class WorkLog : BaseEntity
    {
        private WorkLog(){}

        public WorkLog(int employeeId, int projectId, DateTime workDate, decimal hours, WorkStatus status, string? notes = null)
        {
            EmployeeId = employeeId;
            ProjectId = projectId;
            WorkDate = workDate;
            Hours = hours;
            Status = status;
            Notes = notes;

            CreatedAt = DateTime.UtcNow;
            IsDeleted = false;
        }

        public int EmployeeId { get; set; }
        public int ProjectId { get; set; }
        public string? ProjectName { get; set; }

        public DateTime WorkDate { get; set; }

        public decimal Hours { get; set; }

        public WorkStatus Status { get; set; }

        public string? Notes { get; set; }

        public DateTime? UpdatedAt { get; set; }


        public void Update(decimal hours, WorkStatus status, string? notes = null)
        {
            Hours = hours;
            Status = status;
            Notes = notes;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
