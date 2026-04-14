namespace backend.Features.TimeTrack.WorkLogs.SaveTimesheet
{
    public class SaveTimesheetHandler : IRequestHandler<SaveTimesheetCommand, bool>
    {
        private readonly IWorkLogRepository _repo;
        private readonly EmployeeRepository _employeeRepo;
        private readonly IProjectRepository _projectRepo;
        private readonly ICurrentUserService _currentUser;

        public SaveTimesheetHandler(
            IWorkLogRepository repo,
            EmployeeRepository employeeRepo,
            IProjectRepository projectRepo,
            ICurrentUserService currentUser)
        {
            _repo = repo;
            _employeeRepo = employeeRepo;
            _projectRepo = projectRepo;
            _currentUser = currentUser;
        }

        public async Task<bool> Handle(SaveTimesheetCommand request, CancellationToken cancellationToken)
        {
            var employee = await _employeeRepo.GetByUserIdAsync(_currentUser.UserId);

            if (employee == null)
                throw new Exception("Employee not found.");

            var dto = request.Dto;

            // Validate
            var errors = new Dictionary<string, List<string>>();

            if (dto.Entries == null || !dto.Entries.Any())
            {
                errors["entries"] = new List<string> { "No entries to save." };
                throw new Exceptions.ValidationException(errors);
            }

            foreach (var entry in dto.Entries)
            {
                if (entry.Hours < 0 || entry.Hours > 24)
                {
                    errors["hours"] = new List<string> { $"Hours must be between 0 and 24. (Project: {entry.ProjectId}, Date: {entry.Date})" };
                }

                if (!DateTime.TryParse(entry.Date, out _))
                {
                    errors["date"] = new List<string> { $"Invalid date format: {entry.Date}" };
                }

                var project = await _projectRepo.GetByIdAsync(entry.ProjectId);
                if (project == null || project.IsDeleted)
                {
                    errors["projectId"] = new List<string> { $"Project {entry.ProjectId} does not exist." };
                }
                else if (project.Status != ProjectStatus.Open)
                {
                    errors["projectId"] = new List<string> { $"Cannot log hours on closed project '{project.Name}'." };
                }
            }

            if (errors.Any())
                throw new Exceptions.ValidationException(errors);

            // Build entities
            var entities = dto.Entries.Select(e => new WorkLog(
                employee.Id,
                e.ProjectId,
                DateTime.Parse(e.Date),
                e.Hours,
                e.Notes
            ));

            await _repo.UpsertTimesheetAsync(employee.Id, entities);

            return true;
        }
    }
}
