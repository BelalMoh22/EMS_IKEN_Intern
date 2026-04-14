namespace backend.Features.TimeTrack.WorkLogs.GetMonthlyLogs
{
    public record GetMonthlyLogsQuery(int Year, int Month) : IRequest<IEnumerable<MonthlyWorkLogDTO>>;
}
