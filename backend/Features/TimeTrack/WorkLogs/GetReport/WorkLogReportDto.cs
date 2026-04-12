namespace backend.Features.TimeTrack.WorkLogs.GetReport
{
    public class WorkLogReportDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public decimal TotalHours { get; set; }
    }
}
