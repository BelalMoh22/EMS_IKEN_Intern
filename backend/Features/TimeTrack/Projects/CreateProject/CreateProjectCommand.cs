namespace backend.Features.TimeTrack.Projects.CreateProject
{
    public record CreateProjectCommand(CreateProjectDTO dto) : IRequest<int>;
}
