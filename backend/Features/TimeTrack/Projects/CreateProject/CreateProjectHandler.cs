using backend.Domain.Models;
using Microsoft.AspNetCore.Http.HttpResults;

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

            var project = new Project(dto.Name, dto.Description, dto.DepartmentId, dto.Month, dto.Year, loggedInUserId);

            var id = await _projectRepository.CreateAsync(project);

            return id;
        }
    }
}
