namespace backend.Infrastructure.BusinessRules.Projects
{
    public class ProjectBusinessRules : BaseBusinessRules, IProjectBusinessRules
    {
        private readonly IProjectRepository _projectRepository;
        private readonly DepartmentRepository _departmentRepository;

        public ProjectBusinessRules(
            IProjectRepository projectRepository,
            DepartmentRepository departmentRepository)
        {
            _projectRepository = projectRepository;
            _departmentRepository = departmentRepository;
        }

        // =========================
        // CREATE
        // =========================
        //public async Task ValidateForCreateAsync(CreateProjectDTO dto)
        //{
        //    var errors = ValidationHelper.ValidateModel(dto);

        //    var department = await _departmentRepository.GetByIdAsync(dto.DepartmentId);
        //    if (department == null || department.IsDeleted)
        //        AddError(errors, "departmentId", "Department does not exist.");

        //    var projects = await _projectRepository.GetAsync(dto.DepartmentId, null, null, null);
        //    if (projects.Any(p => p.Name.ToLower() == dto.Name.ToLower()))
        //        AddError(errors, "name", "Project name already exists in this department.");

        //    if (dto.Month < 1 || dto.Month > 12)
        //        AddError(errors, "month", "Month must be between 1 and 12.");

        //    if (dto.Year < 2000)
        //        AddError(errors, "year", "Invalid year.");

        //    if (dto.Status != ProjectStatus.Active)
        //        AddError(errors, "status", "Project must start as Active.");

        //    ThrowIfAny(errors);
        //}

        // =========================
        // UPDATE
        // =========================
        public async Task ValidateForUpdateAsync(int projectId, UpdateProjectDTO dto, Project existing)
        {
            var errors = ValidationHelper.ValidateModel(dto);

            if (existing.IsDeleted)
                AddError(errors, "project", "Project is deleted.");

            if (existing.Status != ProjectStatus.Active)
                AddError(errors, "status", "Only active projects can be updated.");

            if (dto.Month.HasValue && (dto.Month < 1 || dto.Month > 12))
                AddError(errors, "month", "Month must be between 1 and 12.");

            if (!string.IsNullOrWhiteSpace(dto.Name))
            {
                var projects = await _projectRepository.GetAsync(existing.DepartmentId, null, null, null);

                if (projects.Any(p => p.Id != projectId &&
                                      p.Name.Equals(dto.Name, StringComparison.OrdinalIgnoreCase)))
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

            var totalHours = await _projectRepository.GetTotalHoursAsync(project.Id);

            if (totalHours > 0)
                AddError(errors, "project", "Cannot delete project with work logs.");

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

            if (project.Status != ProjectStatus.Active)
                AddError(errors, "status", "Only active projects can be closed.");

            var totalHours = await _projectRepository.GetTotalHoursAsync(project.Id);

            if (totalHours == 0)
                AddError(errors, "project", "Cannot close project without work logs.");

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
            var project = await _projectRepository.GetByIdAsync(projectId);

            if (project == null)
                throw new Exception("Project not found.");

            return project;
        }
    }
}
