namespace backend.Features.TimeTrack.WorkLogs.GetEmployeReport
{
    public record GetEmployeReportQuery(int ProjectId, int EmployeeId) : IRequest<IEnumerable<EmployeeDailyReportDTO>>;
}
