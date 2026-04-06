namespace backend.Features.TimeTrack.Projects.ReopenProject
{
    public record ReopenProjectCommand(int Id) : IRequest<ProjectActionResult>;
}
