namespace backend.Features.TimeTrack.WorkLogs.GetEmployeeContributions
{
    public record GetEmployeeContributionsQuery(int ProjectId) : IRequest<IEnumerable<EmployeeContributionDTO>>;
}
