using EmployeeService.Features.Attendance.Sync;

namespace EmployeeService.Features.Attendance.Details
{
    public record GetAttendanceDetailsQuery(int? EmployeeId, int? Year, int? Month, int? Day) : IRequest<List<AttendanceRecordDto>>;
}
