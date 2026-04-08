namespace backend.Features.TimeTrack.WorkLogs.GetProjectsSummary
{
    public record GetProjectsSummaryQuery : IRequest<IEnumerable<ProjectSummaryDTO>>;
}
