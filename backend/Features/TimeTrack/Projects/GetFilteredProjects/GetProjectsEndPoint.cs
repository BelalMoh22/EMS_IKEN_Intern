namespace backend.Features.TimeTrack.Projects.GetFilteredProjects
{
    public static class GetProjectsEndPoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder group)
        {
            group.MapGet("/", async (int? departmentId, int? month, int? year, ProjectStatus? status, IMediator mediator) =>
            {
                var query = new GetProjectsQuery(departmentId, month, year, status);
                var projects = await mediator.Send(query);
                return Results.Ok(ApiResponse<IEnumerable<ProjectListDto>>.SuccessResponse(projects));
            })
            .WithName("GetFilteredProjects")
            .WithTags("Projects")
            .DocumentApiResponse<IEnumerable<ProjectListDto>>(
                "List projects (filtered)",
                "Returns projects with optional filters (departmentId, month, year, status)."
            );

            return group;
        }
    }
}
