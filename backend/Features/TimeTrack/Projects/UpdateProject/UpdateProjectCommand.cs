namespace backend.Features.TimeTrack.Projects.UpdateProject
{
    public record UpdateProjectCommand(int Id, UpdateProjectDTO dto) : IRequest<ProjectActionResult>;
}
