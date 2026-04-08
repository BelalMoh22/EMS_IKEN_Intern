namespace backend.Features.TimeTrack.WorkLogs.GetDailyLogs
{
    public record GetDailyLogsQuery : IRequest<IEnumerable<DailyWorkLogDTO>>;
}
