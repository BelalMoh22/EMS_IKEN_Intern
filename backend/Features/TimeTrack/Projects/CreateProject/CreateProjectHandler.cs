using backend.Infrastructure.Services.CurrentUserService;

namespace backend.Features.TimeTrack.Projects.CreateProject
{
    public class CreateProjectHandler : IRequestHandler<CreateProjectCommand, int>
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IProjectBusinessRules _rules;
        private readonly ICurrentUserService _currentUser;

        public CreateProjectHandler(IProjectRepository projectRepository,IProjectBusinessRules rules , ICurrentUserService currentUser)
        {
            _projectRepository = projectRepository;
            _rules = rules;
            _currentUser = currentUser;
        }

        public async Task<int> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
        {
            var dto = request.dto;

            await _rules.ValidateForCreateAsync(dto);

            var loggedInUserId = _currentUser.UserId;

            var project = new Project
            {
                Name = dto.Name,
                Description = dto.Description,
                DepartmentId = dto.DepartmentId,
                Month = dto.Month,
                Year = dto.Year,

                Status = ProjectStatus.Active,
                CreatedBy = loggedInUserId
            };

            var id = await _projectRepository.CreateAsync(project);

            return id;
        }
    }
}
