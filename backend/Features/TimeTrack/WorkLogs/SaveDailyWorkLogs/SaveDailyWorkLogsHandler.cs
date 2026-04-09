namespace backend.Features.TimeTrack.WorkLogs.SaveDailyWorkLogs
{
    public class SaveDailyWorkLogsHandler : IRequestHandler<SaveDailyWorkLogsCommand, bool>
    {
        private readonly IWorkLogRepository _workLogRepo;
        private readonly EmployeeRepository _employeeRepo;
        private readonly IWorkLogBusinessRules _rules;
        private readonly ICurrentUserService _currentUser;

        public SaveDailyWorkLogsHandler(IWorkLogRepository workLogRepo,EmployeeRepository employeeRepo,IWorkLogBusinessRules rules,ICurrentUserService currentUser)
        {
            _workLogRepo = workLogRepo;
            _employeeRepo = employeeRepo;
            _rules = rules;
            _currentUser = currentUser;
        }

        public async Task<bool> Handle(SaveDailyWorkLogsCommand request, CancellationToken cancellationToken)
        {
            var employee = await _employeeRepo.GetByUserIdAsync(_currentUser.UserId);

            if (employee == null)
                throw new Exception("Employee not found.");

            await _rules.ValidateDailyLogsAsync(employee.Id, request.Dto);

            var entities = request.Dto.Logs.Select(l => new WorkLog(
                employee.Id,
                l.ProjectId,
                request.Dto.WorkDate,
                l.Hours,
                l.Status,
                l.Notes
            ));

            await _workLogRepo.SaveDailyWorkLogsAsync(employee.Id, request.Dto.WorkDate, entities);

            return true;
        }

    }
}
