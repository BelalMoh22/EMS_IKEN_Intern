namespace backend.Features.TimeTrack.Projects
{
    public static class ProjectsEndpoints
    {
        public static RouteGroupBuilder MapProjectsEndpoints(this RouteGroupBuilder group)
        {
            GetProjectsEndPoint.MapEndpoint(group).RequireAuthorization();
            CreateProjectEndpoint.MapEndpoint(group).RequireAuthorization("ManagerTimeTrack");
            UpdateProjectEndpoint.MapEndpoint(group).RequireAuthorization("ManagerTimeTrack");
            DeleteProjectEndpoint.MapEndpoint(group).RequireAuthorization("ManagerTimeTrack");
            CloseProjectEndpoint.MapEndpoint(group).RequireAuthorization("ManagerTimeTrack");
            ReopenProjectEndpoint.MapEndpoint(group).RequireAuthorization("ManagerTimeTrack");
            return group;
        }
    }
}
