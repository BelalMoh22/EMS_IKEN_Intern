namespace backend.Features.TimeTrack.WorkLogs
{
    public static class WorkLogsEndpoints
    {
        public static RouteGroupBuilder MapWorkLogsEndpoints(this RouteGroupBuilder group)
        {
            // Timesheet operations (/api/worklogs/...)
            GetMonthlyLogsEndpoint.MapEndpoint(group);
            SaveTimesheetEndpoint.MapEndpoint(group);

            // Analysis & Reporting (/api/worklogs/...)
            GetWorkLogsReportEndpoint.MapEndpoint(group);
            GetEmployeReportEndpoint.MapEndpoint(group);
            GetEmployeeContributionsEndpoint.MapEndpoint(group);
            GetProjectsSummaryEndpoint.MapEndpoint(group);

            return group;
        }
    }
}
