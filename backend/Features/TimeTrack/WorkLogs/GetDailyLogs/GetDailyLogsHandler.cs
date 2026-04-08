namespace backend.Features.TimeTrack.WorkLogs.GetDailyLogs
{
    public class GetDailyLogsHandler : IRequestHandler<GetDailyLogsQuery, IEnumerable<DailyWorkLogDTO>>
    {
        private readonly IWorkLogRepository _workLogRepo;
        private readonly EmployeeRepository _employeeRepo;
        private readonly ICurrentUserService _currentUserService;

        public GetDailyLogsHandler(IWorkLogRepository workLogRepo, EmployeeRepository employeeRepo,ICurrentUserService currentUserService)
        {
            _workLogRepo = workLogRepo;
            _employeeRepo = employeeRepo;
            _currentUserService = currentUserService;
        }

        public async Task<IEnumerable<DailyWorkLogDTO>> Handle(GetDailyLogsQuery request, CancellationToken cancellationToken)
        {
            var employee = await _employeeRepo.GetByUserIdAsync(_currentUserService.UserId);
            if (employee == null)
            {
                throw new Exception("Employee profile not found for the current user.");
            }

            var logs = await _workLogRepo.GetDailyLogsAsync(employee.Id);
            
            return logs ?? Enumerable.Empty<DailyWorkLogDTO>();
        }
    }
}
