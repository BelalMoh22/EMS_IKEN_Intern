namespace EmployeeService.Features.Attendance.MyAttendance
{
    public record GetMyAttendanceQuery(int UserId)
        : IRequest<MyAttendanceResultDto>;
}
