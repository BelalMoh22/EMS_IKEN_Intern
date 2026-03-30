namespace EmployeeService.Features.Attendance.Sync
{
    public record SyncAttendanceCommand()
        : IRequest<SyncResultDto>;
}
