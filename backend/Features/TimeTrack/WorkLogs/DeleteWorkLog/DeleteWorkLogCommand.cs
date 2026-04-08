namespace backend.Features.TimeTrack.WorkLogs.DeleteWorkLog
{
    public record DeleteWorkLogCommand(int WorkLogId) : IRequest<bool>;
}
