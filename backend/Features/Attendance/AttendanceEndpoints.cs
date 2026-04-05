

namespace backend.Features.Attendance
{
    public static class AttendanceEndpoints
    {
        public static RouteGroupBuilder MapAttendanceEndpoints(this RouteGroupBuilder group)
        {
            SyncAttendanceEndpoint.MapEndpoint(group).RequireAuthorization("FullCRUD");
            GetMyAttendanceEndpoint.MapEndpoint(group).RequireAuthorization();
            GetMonthlySummaryEndpoint.MapEndpoint(group).RequireAuthorization("FullCRUD");
            GetAttendanceDetailsEndpoint.MapEndpoint(group).RequireAuthorization("FullCRUD");
            return group;
        }
    }
}
