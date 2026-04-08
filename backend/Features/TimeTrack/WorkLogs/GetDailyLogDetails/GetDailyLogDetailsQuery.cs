namespace backend.Features.TimeTrack.WorkLogs.GetDailyLogDetails
{
    public record GetDailyLogDetailsQuery(DateTime Date) : IRequest<DailyWorkLogDetailsDTO>;
}
