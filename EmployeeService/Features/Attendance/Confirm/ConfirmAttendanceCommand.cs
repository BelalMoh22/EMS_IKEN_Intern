namespace EmployeeService.Features.Attendance.Confirm
{
    public record ConfirmAttendanceCommand(List<AttendancePreviewDto> Rows)
        : IRequest<int>;
}
