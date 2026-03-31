using MediatR;
using EmployeeService.Domain.Models;
using EmployeeService.Infrastructure.Repositories;
using EmployeeService.Features.Attendance.Sync;

namespace EmployeeService.Features.Attendance.Details
{
    public class GetAttendanceDetailsHandler : IRequestHandler<GetAttendanceDetailsQuery, List<AttendanceRecordDto>>
    {
        private readonly AttendanceRepository _attendanceRepo;
        private readonly IRepository<Employee> _employeeRepo;

        public GetAttendanceDetailsHandler(AttendanceRepository attendanceRepo, IRepository<Employee> employeeRepo)
        {
            _attendanceRepo = attendanceRepo;
            _employeeRepo = employeeRepo;
        }

        public async Task<List<AttendanceRecordDto>> Handle(GetAttendanceDetailsQuery request, CancellationToken cancellationToken)
        {
            var records = await _attendanceRepo.GetFilteredAttendanceAsync(
                request.EmployeeId, 
                request.Year, 
                request.Month, 
                request.Day);

            var employees = (await _employeeRepo.GetAllAsync()).ToDictionary(e => e.Id);

            return records.Select(r =>
            {
                var emp = employees.GetValueOrDefault(r.EmployeeId);
                return new AttendanceRecordDto
                {
                    EmployeeId = r.EmployeeId,
                    EmployeeName = emp != null ? $"{emp.FirstName} {emp.Lastname}" : "Unknown",
                    Date = r.Date.ToString("yyyy-MM-dd"),
                    CheckIn = r.CheckIn?.ToString(@"hh\:mm"),
                    CheckOut = r.CheckOut?.ToString(@"hh\:mm"),
                    LateMinutes = r.LateMinutes,
                    EarlyLeaveMinutes = r.EarlyLeaveMinutes,
                    WorkingMinutes = r.WorkingMinutes,
                    Status = r.Status
                };
            }).ToList();
        }
    }
}
