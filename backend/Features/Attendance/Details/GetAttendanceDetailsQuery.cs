namespace backend.Features.Attendance.Details
{
    public record GetAttendanceDetailsQuery(int? EmployeeId, int? Year, int? Month, int? Day) : IRequest<List<AttendanceRecordDto>>;
}
