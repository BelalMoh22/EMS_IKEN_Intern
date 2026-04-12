namespace backend.Features.TimeTrack.WorkLogs.GetReport
{
    public class GetWorkLogsReportHandler : IRequestHandler<GetWorkLogsReportQuery, IEnumerable<WorkLogReportDto>>
    {
        private readonly IWorkLogRepository _repo;
        private readonly EmployeeRepository _employeeRepo;
        private readonly ICurrentUserService _currentUserService;

        public GetWorkLogsReportHandler(IWorkLogRepository repo, EmployeeRepository employeeRepo, ICurrentUserService currentUserService)
        {
            _repo = repo;
            _employeeRepo = employeeRepo;
            _currentUserService = currentUserService;
        }

        public async Task<IEnumerable<WorkLogReportDto>> Handle(GetWorkLogsReportQuery request, CancellationToken cancellationToken)
        {
            int? managerId = null;

            // If user is a manager, only allow them to see their department's employees
            if (request.UserRole == Roles.Manager.ToString())
            {
                var managerEmployee = await _employeeRepo.GetByUserIdAsync(_currentUserService.UserId);
                if (managerEmployee != null)
                {
                    managerId = managerEmployee.Id;
                }
            }

            return await _repo.GetWorkLogsReportAsync(request.StartDate, request.EndDate, managerId);
        }
    }
}
