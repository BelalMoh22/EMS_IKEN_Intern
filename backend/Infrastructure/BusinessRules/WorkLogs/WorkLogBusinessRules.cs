namespace backend.Infrastructure.BusinessRules.WorkLogs
{
    public class WorkLogBusinessRules : BaseBusinessRules, IWorkLogBusinessRules
    {
        private readonly IProjectRepository _projectRepo;

        public WorkLogBusinessRules(IProjectRepository projectRepo)
        {
            _projectRepo = projectRepo;
        }

        // =========================
        // PROJECT VALIDATION
        // =========================
        public async Task ValidateProjectAsync(int projectId, Dictionary<string, List<string>> errors)
        {
            var project = await _projectRepo.GetByIdAsync(projectId);

            if (project == null || project.IsDeleted)
            {
                AddError(errors, "projectId", "Project does not exist.");
                return;
            }

            if (project.Status != ProjectStatus.Open)
                AddError(errors, "projectId", "Cannot log hours on closed project.");
        }
    }
}
