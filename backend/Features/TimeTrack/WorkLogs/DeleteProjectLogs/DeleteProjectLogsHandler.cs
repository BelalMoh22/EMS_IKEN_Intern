namespace backend.Features.TimeTrack.WorkLogs.DeleteProjectLogs
{
    public class DeleteProjectLogsHandler : IRequestHandler<DeleteProjectLogsCommand, bool>
    {
        private readonly IWorkLogRepository _workLogRepo;
        private readonly EmployeeRepository _employeeRepo;
        private readonly ICurrentUserService _currentUser;
        private readonly IWorkLogBusinessRules _rules;

        public DeleteProjectLogsHandler(
            IWorkLogRepository workLogRepo,
            EmployeeRepository employeeRepo,
            ICurrentUserService currentUser,
            IWorkLogBusinessRules rules)
        {
            _workLogRepo = workLogRepo;
            _employeeRepo = employeeRepo;
            _currentUser = currentUser;
            _rules = rules;
        }

        public async Task<bool> Handle(DeleteProjectLogsCommand request, CancellationToken cancellationToken)
        {
            var employee = await _employeeRepo.GetByUserIdAsync(_currentUser.UserId);
            if (employee == null) 
                throw new Exception("Employee not found.");

            await _rules.CheckEmployeeProjectLogsExistAsync(employee.Id, request.ProjectId);

            var rows = await _workLogRepo.DeleteProjectLogsAsync(employee.Id, request.ProjectId);

            return rows > 0;
        }
    }
}
