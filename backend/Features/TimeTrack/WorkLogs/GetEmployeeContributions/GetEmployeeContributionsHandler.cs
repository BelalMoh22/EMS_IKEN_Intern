
namespace backend.Features.TimeTrack.WorkLogs.GetEmployeeContributions
{
    public class GetEmployeeContributionsHandler : IRequestHandler<GetEmployeeContributionsQuery, IEnumerable<EmployeeContributionDTO>>
    {
        private readonly IWorkLogRepository _repo;
        public GetEmployeeContributionsHandler(IWorkLogRepository repo)
        {
            _repo = repo;
        }
        public async Task<IEnumerable<EmployeeContributionDTO>> Handle(GetEmployeeContributionsQuery request, CancellationToken cancellationToken)
        {
            return await _repo.GetProjectEmployeesAsync(request.ProjectId);
        }
    }
}
