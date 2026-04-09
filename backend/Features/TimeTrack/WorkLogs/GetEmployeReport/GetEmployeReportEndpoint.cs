namespace backend.Features.TimeTrack.WorkLogs.GetEmployeReport
{
    public static class GetEmployeReportEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapGet("/projects/{projectId:int}/employees/{employeeId:int}/report",
                async ([FromServices] IMediator mediator, [FromRoute] int projectId, [FromRoute] int employeeId) =>
            {
                var query = new GetEmployeReportQuery(projectId, employeeId);
                var result = await mediator.Send(query);

                return Results.Ok(ApiResponse<IEnumerable<EmployeeDailyReportDTO>>.SuccessResponse(result, "Employee project report retrieved successfully"));
            })
            .WithName("GetEmployeeReport")
            .WithTags("WorkLogs")
            .RequireAuthorization("ManagerTimeTrack")
            .DocumentApiResponse<IEnumerable<EmployeeDailyReportDTO>>(
                "Get employee project report (manager)",
                "Returns a daily report for an employee on a given project (manager-only)."
            );
        }
    }
}
