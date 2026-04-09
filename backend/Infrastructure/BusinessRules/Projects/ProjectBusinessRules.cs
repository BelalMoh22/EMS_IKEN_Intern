namespace backend.Infrastructure.BusinessRules.Projects
{
    public class ProjectBusinessRules : BaseBusinessRules, IProjectBusinessRules
    {
        private readonly IProjectRepository _projectRepository;
        private readonly DepartmentRepository _departmentRepository;
        private readonly ICurrentUserService _currentUser;

        public ProjectBusinessRules(
            IProjectRepository projectRepository,
            DepartmentRepository departmentRepository,
            ICurrentUserService currentUser)
        {
            _projectRepository = projectRepository;
            _departmentRepository = departmentRepository;
            _currentUser = currentUser;
        }

        // ========================
        // Filter Validation
        //==========================
        public Task ValidateFilterAsync(GetProjectsQuery query)
        {
            var errors = new Dictionary<string, List<string>>();

            if (query.month.HasValue && (query.month < 1 || query.month > 12))
                AddError(errors, "month", "Month must be between 1 and 12.");

            if (query.year.HasValue && (query.year < 2000 || query.year > DateTime.UtcNow.Year))
                AddError(errors, "year", "Invalid year.");

            ThrowIfAny(errors);

            return Task.CompletedTask;
        }

        // =========================
        // CREATE
        // =========================
        public async Task ValidateForCreateAsync(int departmentId, CreateProjectDTO dto)
        {
            var errors = ValidationHelper.ValidateModel(dto);
            var projects = await _projectRepository.GetAsync(departmentId, null, null, null);
            if (projects.Any(p => p.Name.ToLower() == dto.Name.ToLower()))
                AddError(errors, "name", "Project name already exists in this department.");

            ThrowIfAny(errors);
        }

        // =========================
        // UPDATE
        // =========================
        public async Task ValidateForUpdateAsync(int projectId, UpdateProjectDTO dto, Project existing)
        {
            var errors = ValidationHelper.ValidateModel(dto);

            if (existing.IsDeleted)
                AddError(errors, "project", "Project is deleted.");

            if (existing.Status != ProjectStatus.Open)
                AddError(errors, "status", "Only active projects can be updated.");

            if (!string.IsNullOrWhiteSpace(dto.Name))
            {
                var projects = await _projectRepository.GetAsync(existing.DepartmentId, null, null, null);

                if (projects.Any(p => p.Id != projectId && p.Name.Equals(dto.Name, StringComparison.OrdinalIgnoreCase)))
                {
                    AddError(errors, "name", "Project name already exists in this department.");
                }
            }

            ThrowIfAny(errors);
        }

        // =========================
        // DELETE
        // =========================
        public async Task ValidateForDeleteAsync(Project project)
        {
            var errors = new Dictionary<string, List<string>>();

            if (project.IsDeleted)
                AddError(errors, "project", "Project already deleted.");

            ThrowIfAny(errors);
        }

        // =========================
        // CLOSE
        // =========================
        public async Task ValidateForCloseAsync(Project project)
        {
            var errors = new Dictionary<string, List<string>>();

            if (project.IsDeleted)
                AddError(errors, "project", "Project is deleted.");

            if (project.Status != ProjectStatus.Open)
                AddError(errors, "status", "Only active projects can be closed.");

            var totalHours = await _projectRepository.GetTotalHoursAsync(project.Id);

            // if (totalHours == 0)
            //     AddError(errors, "project", "Cannot close project without work logs.");

            ThrowIfAny(errors);
        }

        // =========================
        // REOPEN
        // =========================
        public async Task ValidateForReopenAsync(Project project)
        {
            var errors = new Dictionary<string, List<string>>();

            if (project.IsDeleted)
                AddError(errors, "project", "Project is deleted.");

            if (project.Status != ProjectStatus.Closed)
                AddError(errors, "status", "Only closed projects can be reopened.");

            ThrowIfAny(errors);
        }

        // =========================
        // EXISTS
        // =========================
        public async Task<Project> CheckProjectExistsAsync(int projectId)
        {
            if (projectId <= 0)
            {
                throw new Exceptions.ValidationException(
                    new Dictionary<string, List<string>>
                    {
                        { "id", new List<string> { "Id must be a positive integer." } }
                    });
            }

            var project = await _projectRepository.GetByIdAsync(projectId);

            if (project == null)
                throw new NotFoundException($"Project with Id {projectId} not found.");

            return project;
        }

        // =========================
        // OWNERSHIP & SECURITY
        // =========================
        public async Task ValidateOwnershipAndWriteAccessAsync(Project existingProject)
        {
            var loggedInUserId = _currentUser.UserId;
            var department = await _departmentRepository.GetByManagerIdAsync(loggedInUserId);

            if (department == null || existingProject.DepartmentId != department.Id)
            {
                throw new UnauthorizedAccessException("You are not authorized to modify projects outside your department scope.");
            }
        }
    }
}
