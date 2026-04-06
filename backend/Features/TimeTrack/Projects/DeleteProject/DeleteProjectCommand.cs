namespace backend.Features.TimeTrack.Projects.DeleteProject
{
    public record DeleteProjectCommand(int Id) : IRequest<ProjectActionResult>;
}
