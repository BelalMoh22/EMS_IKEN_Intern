

namespace EmployeeService.Features.Attendance
{
    public static class AttendanceEndpoints
    {
        public static RouteGroupBuilder MapAttendanceEndpoints(this RouteGroupBuilder group)
        {
            SyncAttendanceEndpoint.MapEndpoint(group);
            GetMyAttendanceEndpoint.MapEndpoint(group);
            GetMonthlySummaryEndpoint.MapEndpoint(group);
            GetAttendanceDetailsEndpoint.MapEndpoint(group);
            return group;
        }
    }
}
