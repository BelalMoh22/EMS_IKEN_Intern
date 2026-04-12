namespace backend.Features.TimeTrack.WorkLogs.GetReport
{
    public record GetWorkLogsReportQuery(DateTime StartDate, DateTime EndDate, string UserRole) : IRequest<IEnumerable<WorkLogReportDto>>;
}
