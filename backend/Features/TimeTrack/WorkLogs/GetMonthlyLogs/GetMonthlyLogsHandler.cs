namespace backend.Features.TimeTrack.WorkLogs.GetMonthlyLogs
{
    public class GetMonthlyLogsHandler : IRequestHandler<GetMonthlyLogsQuery, IEnumerable<MonthlyWorkLogDTO>>
    {
        private readonly IWorkLogRepository _repo;
        private readonly EmployeeRepository _employeeRepo;
        private readonly ICurrentUserService _currentUser;

        public GetMonthlyLogsHandler(IWorkLogRepository repo, EmployeeRepository employeeRepo, ICurrentUserService currentUser)
        {
            _repo = repo;
            _employeeRepo = employeeRepo;
            _currentUser = currentUser;
        }

        public async Task<IEnumerable<MonthlyWorkLogDTO>> Handle(GetMonthlyLogsQuery request, CancellationToken cancellationToken)
        {
            var employee = await _employeeRepo.GetByUserIdAsync(_currentUser.UserId);

            if (employee == null)
                throw new Exception("Employee not found.");

            return await _repo.GetMonthlyLogsAsync(employee.Id, request.Year, request.Month);
        }
    }
}
