using backend.Domain.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using backend.Infrastructure.Repositories;

namespace backend.Features.TimeTrack.Projects.CreateProject
{
    public class CreateProjectHandler : IRequestHandler<CreateProjectCommand, int>
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IProjectBusinessRules _rules;
        private readonly ICurrentUserService _currentUser;
        private readonly DepartmentRepository _departmentRepository;

        public CreateProjectHandler(
            IProjectRepository projectRepository, 
            IProjectBusinessRules rules, 
            ICurrentUserService currentUser, 
            DepartmentRepository departmentRepository)
        {
            _projectRepository = projectRepository;
            _rules = rules;
            _currentUser = currentUser;
            _departmentRepository = departmentRepository;
        }

        public async Task<int> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
        {
            var dto = request.dto;

            var loggedInUserId = _currentUser.UserId;

            var department = await _departmentRepository.GetByManagerIdAsync(loggedInUserId);

            if (department == null)
                throw new NotFoundException("Manager is not assigned to any department.");

            await _rules.ValidateForCreateAsync(department.Id, dto);

            var project = new Project(dto.Name, dto.Description, department.Id, loggedInUserId);

            var id = await _projectRepository.CreateAsync(project);

            return id;
        }
    }
}
