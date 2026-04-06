namespace backend.Features.TimeTrack.Projects.GetFilteredProjects
{
    public static class GetProjectsEndPoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder group)
        {
            group.MapGet("/filter", async (int? departmentId, int? month, int? year, ProjectStatus? status, IMediator mediator) =>
            {
                var query = new GetProjectsQuery(departmentId, month, year, status);
                var projects = await mediator.Send(query);
                return Results.Ok(projects);
            }).WithName("GetFilteredProjects").WithTags("Projects");

            return group;
        }
    }
}
