namespace backend.Features.TimeTrack.WorkLogs.SaveDailyWorkLogs
{
    public record SaveDailyWorkLogsCommand(CreateUpdateDailyWorkLogsDTO Dto) : IRequest<bool>;
}
