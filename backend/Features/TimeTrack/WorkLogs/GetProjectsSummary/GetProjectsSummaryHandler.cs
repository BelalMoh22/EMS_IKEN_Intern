namespace backend.Features.TimeTrack.WorkLogs.GetProjectsSummary
{
    public class GetProjectsSummaryHandler : IRequestHandler<GetProjectsSummaryQuery, IEnumerable<ProjectSummaryDTO>>
    {
        private readonly IWorkLogRepository _repo;

        public GetProjectsSummaryHandler(IWorkLogRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<ProjectSummaryDTO>> Handle(GetProjectsSummaryQuery request,CancellationToken cancellationToken)
        {
            return await _repo.GetProjectsSummaryAsync();
        }
    }
}
