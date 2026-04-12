namespace backend.Features.Attendance.Details
{
    public class GetAttendanceDetailsHandler
      : IRequestHandler<GetAttendanceDetailsQuery, List<AttendanceRecordDto>>
    {
        private readonly AttendanceRepository _attendanceRepo;
        private readonly IRepository<Employee> _employeeRepo;

        public GetAttendanceDetailsHandler(AttendanceRepository attendanceRepo,IRepository<Employee> employeeRepo)
        {
            _attendanceRepo = attendanceRepo;
            _employeeRepo = employeeRepo;
        }

        public async Task<List<AttendanceRecordDto>> Handle(GetAttendanceDetailsQuery request,CancellationToken cancellationToken)
        {
            var records = await _attendanceRepo.GetFilteredAttendanceAsync(
                request.EmployeeId,
                request.Year,
                request.Month,
                request.Day
            );

            Employee? employee = null;

            if (request.EmployeeId.HasValue)
            {
                employee = await _employeeRepo.GetByIdAsync(request.EmployeeId.Value);
            }

            var result = records.Select(r => new AttendanceRecordDto
            {
                EmployeeId = r.EmployeeId,
                EmployeeName = employee != null? $"{employee.FirstName} {employee.Lastname}": "Unknown",
                Date = r.Date.ToString("yyyy-MM-dd"),
                CheckIn = r.CheckIn?.ToString(@"hh\:mm"),
                CheckOut = r.CheckOut?.ToString(@"hh\:mm"),
                LateMinutes = r.LateMinutes,
                EarlyLeaveMinutes = r.EarlyLeaveMinutes,
                WorkingMinutes = r.WorkingMinutes,
                Status = r.Status
            }).ToList();

            return result;
        }
    }
}