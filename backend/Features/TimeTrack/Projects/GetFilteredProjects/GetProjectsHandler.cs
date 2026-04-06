namespace backend.Features.TimeTrack.Projects.GetFilteredProjects
{
    public class GetProjectsHandler : IRequestHandler<GetProjectsQuery, IEnumerable<ProjectListDto>>
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IProjectBusinessRules _rules;
        public GetProjectsHandler(IProjectRepository projectRepository , IProjectBusinessRules rules)
        {
            _projectRepository = projectRepository;
            _rules = rules;
        }
        public async Task<IEnumerable<ProjectListDto>> Handle(GetProjectsQuery request, CancellationToken cancellationToken)
        {

            await _rules.ValidateFilterAsync(request);

            var projects = await _projectRepository.GetAsync(
                request.departmentId,
                request.month,
                request.year,
                request.status);

            var result = projects.Select(p => new ProjectListDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Month = p.Month,
                Year = p.Year,
                Status = p.Status
            });

            return result;
        }
    }
}
