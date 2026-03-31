namespace EmployeeService.Features.Attendance
{
    public static class AttendanceEndpoints
    {
        public static RouteGroupBuilder MapAttendanceEndpoints(this RouteGroupBuilder group)
        {
            Sync.SyncAttendanceEndpoint.MapEndpoint(group);
            MyAttendance.GetMyAttendanceEndpoint.MapEndpoint(group);
            MonthlySummary.GetMonthlySummaryEndpoint.MapEndpoint(group);
            Details.GetAttendanceDetailsEndpoint.MapEndpoint(group);
            return group;
        }
    }
}
