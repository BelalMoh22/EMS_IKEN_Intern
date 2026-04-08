namespace backend.Features.TimeTrack.WorkLogs
{
    public static class WorkLogsEndpoints
    {
        public static RouteGroupBuilder MapWorkLogsEndpoints(this RouteGroupBuilder group)
        {
            GetDailyLogsEndpoint.MapEndpoint(group);
            SaveDailyWorkLogsEndpoint.MapEndpoint(group);
            UpdateProjectWorkLogEndpoint.MapEndpoint(group);
            GetDailyLogDetailsEndpoint.MapEndpoint(group);
            GetEmployeReportEndpoint.MapEndpoint(group);

            return group;
        }
    }
}
