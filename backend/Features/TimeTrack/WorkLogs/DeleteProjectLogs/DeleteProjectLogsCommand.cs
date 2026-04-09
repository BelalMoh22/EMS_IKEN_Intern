namespace backend.Features.TimeTrack.WorkLogs.DeleteProjectLogs
{
    public record DeleteProjectLogsCommand(int ProjectId) : IRequest<bool>;
}
