namespace backend.Features.TimeTrack.Projects.GetProjectById
{
    public record GetProjectByIdQuery(int Id) : IRequest<ProjectListDto>;
}
