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
        private readonly EmployeeRepository _employeeRepository;

        public CreateProjectHandler(IProjectRepository projectRepository, IProjectBusinessRules rules, ICurrentUserService currentUser, DepartmentRepository departmentRepository , EmployeeRepository employeeRepository)
        {
            _projectRepository = projectRepository;
            _rules = rules;
            _currentUser = currentUser;
            _departmentRepository = departmentRepository;
            _employeeRepository = employeeRepository;
        }

        public async Task<int> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
        {
            var dto = request.dto;

            var loggedInUserId = _currentUser.UserId;

            var employee = await _employeeRepository.GetByUserIdAsync(loggedInUserId);

            if (employee == null)
                throw new NotFoundException("Employee not found for current user.");

            var department = await _departmentRepository.GetByManagerIdAsync(employee.Id);

            if (department == null)
                throw new NotFoundException("Manager is not assigned to any department.");

            await _rules.ValidateForCreateAsync(department.Id, dto);

            var project = new Project(dto.Name, dto.Description, department.Id, employee.Id);

            var id = await _projectRepository.CreateAsync(project);

            return id;
        }
    }
}
