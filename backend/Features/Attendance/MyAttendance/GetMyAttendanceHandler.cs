namespace backend.Features.Attendance.MyAttendance
{
    public class GetMyAttendanceHandler
        : IRequestHandler<GetMyAttendanceQuery, MyAttendanceResultDto>
    {
        private readonly AttendanceRepository _attendanceRepo;
        private readonly EmployeeRepository _employeeRepo;
        private readonly ILogger<GetMyAttendanceHandler> _logger;

        public GetMyAttendanceHandler(
            AttendanceRepository attendanceRepo,
            EmployeeRepository employeeRepo,
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
            var employee = await _employeeRepo.GetByUserIdAsync(request.UserId);

            var records = await _attendanceRepo.GetFilteredAttendanceAsync(employee.Id, request.Year, request.Month, request.Day);

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
                "Fetched {Count} attendance records for Employee {EmployeeId} (Filters: Y:{Year}, M:{Month}, D:{Day}).",
                result.Records.Count, employee.Id, request.Year, request.Month, request.Day);

            return result;
        }
    }
}
