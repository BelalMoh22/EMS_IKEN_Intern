namespace backend.Features.TimeTrack.WorkLogs.GetDailyLogDetails
{
    public class GetDailyLogDetailsHandler : IRequestHandler<GetDailyLogDetailsQuery, DailyWorkLogDetailsDTO>
    {
        private readonly IWorkLogRepository _workLogRepo;
        private readonly EmployeeRepository _employeeRepo;
        private readonly ICurrentUserService _currentUser;

        public GetDailyLogDetailsHandler(IWorkLogRepository workLogRepo, EmployeeRepository employeeRepo, ICurrentUserService currentUser)
        {
            _workLogRepo = workLogRepo;
            _employeeRepo = employeeRepo;
            _currentUser = currentUser;
        }

        public async Task<DailyWorkLogDetailsDTO> Handle(GetDailyLogDetailsQuery request, CancellationToken cancellationToken)
        {
            var employee = await _employeeRepo.GetByUserIdAsync(_currentUser.UserId);
            if (employee == null) 
                throw new Exception("Employee not found.");

            var logs = await _workLogRepo.GetDailyWorkLogForEmployee(employee.Id, request.Date);

            return new DailyWorkLogDetailsDTO
            {
                Date = request.Date,
                TotalHours = logs.Sum(l => l.Hours),
                Logs = logs.Select(l => new WorkLogResponseItemDTO
                {
                    Id = l.Id,
                    ProjectId = l.ProjectId,
                    Hours = l.Hours,
                    Status = l.Status,
                    Notes = l.Notes
                }).ToList()
            };
        }
    }
}
