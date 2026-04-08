namespace backend.Features.TimeTrack.WorkLogs.Dto_s
{
    public class EmployeeContributionDTO
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public decimal TotalHours { get; set; }
    }
}
