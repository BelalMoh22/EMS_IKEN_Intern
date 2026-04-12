namespace backend.Features.TimeTrack.Projects.GetFilteredProjects
{
    public class GetProjectsHandler : IRequestHandler<GetProjectsQuery, IEnumerable<ProjectListDto>>
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IProjectBusinessRules _rules;
        private readonly ICurrentUserService _currentUser;
        private readonly DepartmentRepository _departmentRepository;
        private readonly EmployeeRepository _employeeRepository;

        public GetProjectsHandler(IProjectRepository projectRepository, IProjectBusinessRules rules, ICurrentUserService currentUser, DepartmentRepository departmentRepository, EmployeeRepository employeeRepository)
        {
            _projectRepository = projectRepository;
            _rules = rules;
            _currentUser = currentUser;
            _departmentRepository = departmentRepository;
            _employeeRepository = employeeRepository;
        }
        public async Task<IEnumerable<ProjectListDto>> Handle(GetProjectsQuery request, CancellationToken cancellationToken)
        {
            await _rules.ValidateFilterAsync(request);

            var deptId = request.departmentId;

            // Isolation logic: Managers only see their own department's projects
            var loggedInUserId = _currentUser.UserId;
            if (loggedInUserId != null)
            {
                var employee = await _employeeRepository.GetByUserIdAsync(loggedInUserId);
                if (employee != null)
                {
                    var managerDept = await _departmentRepository.GetByManagerIdAsync(employee.Id);
                    if (managerDept != null)
                    {
                        deptId = managerDept.Id;
                    }
                }
            }

            var projects = await _projectRepository.GetAsync(deptId, request.month, request.year, request.status);

            var result = projects.Select(p => new ProjectListDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Status = p.Status,
                DepartmentId = p.DepartmentId,
                CreatedAt = p.CreatedAt
            });

            return result;
        }
    }
}
