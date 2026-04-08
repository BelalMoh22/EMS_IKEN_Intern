namespace backend.Features.TimeTrack.WorkLogs.UpdateProjectWorkLog
{
    public record UpdateProjectWorkLogCommand(int Id, UpdateWorkLogDTO Dto) : IRequest<WorkLogResponseItemDTO>;
}
