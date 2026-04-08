namespace backend.Infrastructure.BusinessRules.WorkLogs
{
    public class WorkLogBusinessRules : BaseBusinessRules, IWorkLogBusinessRules
    {
        private readonly IWorkLogRepository _repo;
        private readonly IProjectRepository _projectRepo;

        public WorkLogBusinessRules(IWorkLogRepository repo, IProjectRepository projectRepo)
        {
            _repo = repo;
            _projectRepo = projectRepo;
        }

        // =========================
        // DAILY (Bulk Replace)
        // =========================
        public async Task ValidateDailyLogsAsync(int employeeId, CreateUpdateDailyWorkLogsDTO dto)
        {
            var errors = ValidationHelper.ValidateModel(dto);

            if (dto.Logs == null || !dto.Logs.Any())
            {
                AddError(errors, "logs", "At least one project is required.");
                ThrowIfAny(errors);
            }

            var projectIds = new HashSet<int>();
            decimal totalHours = 0;

            foreach (var log in dto.Logs)
            {
                if (!projectIds.Add(log.ProjectId))
                    AddError(errors, "logs", $"Duplicate project {log.ProjectId} is not allowed.");

                if (log.Hours <= 0 || log.Hours > 24)
                    AddError(errors, "hours", "Hours must be between 0 and 24.");

                totalHours += log.Hours;

                ValidateStatus(log.Status, errors);

                await ValidateProjectAsync(log.ProjectId, errors);
            }

            if (totalHours > 24)
                AddError(errors, "totalHours", "Total daily hours cannot exceed 24.");

            ThrowIfAny(errors);
        }

        // =========================
        // CREATE (Incremental)
        // =========================
        public async Task ValidateForCreateAsync(int employeeId, CreateWorkLogDTO dto)
        {
            var errors = ValidationHelper.ValidateModel(dto);

            if (dto.Hours <= 0 || dto.Hours > 24)
                AddError(errors, "hours", "Hours must be between 0 and 24.");

            ValidateStatus(dto.Status, errors);

            await ValidateProjectAsync(dto.ProjectId, errors);

            await ValidateDailyHoursLimitAsync(employeeId, dto.WorkDate, dto.Hours, errors);

            ThrowIfAny(errors);
        }

        // =========================
        // UPDATE (Incremental)
        // =========================
        public async Task ValidateForUpdateAsync(int employeeId, int workLogId, UpdateWorkLogDTO dto, WorkLog existing)
        {
            var errors = ValidationHelper.ValidateModel(dto);

            if (existing.IsDeleted)
                AddError(errors, "workLog", "Work log is deleted.");

            ValidateOwnership(employeeId, existing, errors);

            var newHours = dto.Hours ?? existing.Hours;

            if (newHours <= 0 || newHours > 24)
                AddError(errors, "hours", "Hours must be between 0 and 24.");

            if (dto.Status.HasValue)
                ValidateStatus(dto.Status.Value, errors);

            await ValidateDailyHoursLimitAsync(employeeId, existing.WorkDate, newHours, errors, existing.Id);

            ThrowIfAny(errors);
        }

        // =========================
        // DELETE
        // =========================
        public async Task ValidateForDeleteAsync(int employeeId, WorkLog existing)
        {
            var errors = new Dictionary<string, List<string>>();

            if (existing.IsDeleted)
                AddError(errors, "workLog", "Work log already deleted.");

            ValidateOwnership(employeeId, existing, errors);

            ThrowIfAny(errors);
        }

        // =========================
        // EXISTS
        // =========================
        public async Task<WorkLog> CheckWorkLogExistsAsync(int workLogId)
        {
            var log = await _repo.GetByIdAsync(workLogId);

            if (log == null)
                throw new Exception("Work log not found.");

            return log;
        }

        // =========================
        // OWNERSHIP
        // =========================
        public void ValidateOwnership(int employeeId, WorkLog existing, Dictionary<string, List<string>> errors)
        {
            if (existing.EmployeeId != employeeId)
                AddError(errors, "ownership", "You are not allowed to modify this work log.");
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

        // =========================
        // DAILY HOURS LIMIT
        // =========================
        public async Task ValidateDailyHoursLimitAsync(int employeeId, DateTime date, decimal newHours, Dictionary<string, List<string>> errors, int? excludeLogId = null)
        {
            var logs = await _repo.GetDailyWorkLogForEmployee(employeeId, date);

            var total = logs
                .Where(l => excludeLogId == null || l.Id != excludeLogId)
                .Sum(l => l.Hours);

            if (total + newHours > 24)
                AddError(errors, "totalHours", $"Total daily hours cannot exceed 24. (Currently: {total}, Attempted: {newHours})");
        }

        public void ValidateStatus(WorkStatus status, Dictionary<string, List<string>> errors)
        {
            if (!Enum.IsDefined(typeof(WorkStatus), status))
                AddError(errors, "status", "Invalid work status value.");
        }
    }
}
