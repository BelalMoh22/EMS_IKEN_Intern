namespace backend.Features.TimeTrack.WorkLogs
{
    public static class WorkLogsEndpoints
    {
        public static RouteGroupBuilder MapWorkLogsEndpoints(this RouteGroupBuilder group)
        {
            // Single log operations (/api/worklogs/log/...)
            var logGroup = group.MapGroup("/log");
            CreateProjectWorkLogEndpoint.MapEndpoint(logGroup);
            DeleteWorkLogEndpoint.MapEndpoint(logGroup);
            UpdateProjectWorkLogEndpoint.MapEndpoint(logGroup);

            // Daily operations (/api/worklogs/daily/...)
            var dailyGroup = group.MapGroup("/daily");
            GetDailyLogsEndpoint.MapEndpoint(dailyGroup);
            SaveDailyWorkLogsEndpoint.MapEndpoint(dailyGroup);
            GetDailyLogDetailsEndpoint.MapEndpoint(dailyGroup);
            DeleteProjectLogsEndpoint.MapEndpoint(dailyGroup);

            // Analysis & Reporting (/api/worklogs/...)
            GetEmployeReportEndpoint.MapEndpoint(group);
            GetEmployeeContributionsEndpoint.MapEndpoint(group);
            GetProjectsSummaryEndpoint.MapEndpoint(group);

            return group;
        }
    }
}
