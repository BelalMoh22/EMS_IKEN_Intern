namespace EmployeeService.Features.Attendance.MyAttendance
{
    public class GetMyAttendanceHandler
        : IRequestHandler<GetMyAttendanceQuery, MyAttendanceResultDto>
    {
        private readonly AttendanceRepository _attendanceRepo;
        private readonly IRepository<Employee> _employeeRepo;
        private readonly ILogger<GetMyAttendanceHandler> _logger;

        public GetMyAttendanceHandler(
            AttendanceRepository attendanceRepo,
            IRepository<Employee> employeeRepo,
            ILogger<GetMyAttendanceHandler> logger)
        {
            _attendanceRepo = attendanceRepo;
            _employeeRepo = employeeRepo;
            _logger = logger;
        }

        public async Task<MyAttendanceResultDto> Handle(
            GetMyAttendanceQuery request,
            CancellationToken cancellationToken)
        {
            // Find the employee by UserId
            var allEmployees = await _employeeRepo.GetAllAsync();
            var employee = allEmployees.FirstOrDefault(e => e.UserId == request.UserId)
                ?? throw new KeyNotFoundException($"No employee found for UserId {request.UserId}.");

            var records = await _attendanceRepo.GetByEmployeeIdAsync(employee.Id);

            var result = new MyAttendanceResultDto();

            foreach (var r in records.OrderByDescending(r => r.Date))
            {
                result.Records.Add(new MyAttendanceRecordDto
                {
                    Date = r.Date.ToString("yyyy-MM-dd"),
                    CheckIn = r.CheckIn?.ToString(@"hh\:mm"),
                    CheckOut = r.CheckOut?.ToString(@"hh\:mm"),
                    Status = r.Status,
                    LateMinutes = r.LateMinutes,
                    EarlyLeaveMinutes = r.EarlyLeaveMinutes,
                    WorkingMinutes = r.WorkingMinutes
                });
            }

            result.TotalLateMinutes = result.Records.Sum(r => r.LateMinutes);
            result.TotalEarlyLeaveMinutes = result.Records.Sum(r => r.EarlyLeaveMinutes);
            result.TotalWorkingMinutes = result.Records.Sum(r => r.WorkingMinutes);

            _logger.LogInformation(
                "Fetched {Count} attendance records for Employee {EmployeeId}.",
                result.Records.Count, employee.Id);

            return result;
        }
    }
}
