namespace backend.Features.TimeTrack.WorkLogs.GetEmployeeContributions
{
    public static class GetEmployeeContributionsEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapGet("/projects/{projectId}/employees", async (int projectId, [FromServices] IMediator mediator) =>
            {
                var query = new GetEmployeeContributionsQuery(projectId);

                var result = await mediator.Send(query);

                return Results.Ok(
                    ApiResponse<IEnumerable<EmployeeContributionDTO>>
                    .SuccessResponse(result, "Employee contributions retrieved successfully"));
            }).WithName("GetEmployeeContributions").WithTags("WorkLogs").RequireAuthorization("ManagerTimeTrack")
            .DocumentApiResponse<IEnumerable<EmployeeContributionDTO>>(
                "Get employee contributions (manager)",
                "Returns per-employee contribution details for a project (manager-only)."
            );
        }
    }
}
