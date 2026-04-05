namespace backend.Features.Attendance.MyAttendance
{
    public record GetMyAttendanceQuery(int UserId, int? Year = null, int? Month = null, int? Day = null)
        : IRequest<MyAttendanceResultDto>;
}
