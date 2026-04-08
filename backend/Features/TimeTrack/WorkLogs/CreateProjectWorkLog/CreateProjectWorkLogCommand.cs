namespace backend.Features.TimeTrack.WorkLogs.CreateProjectWorkLog
{
    public record CreateProjectWorkLogCommand(CreateWorkLogDTO Dto) : IRequest<int>;
}
