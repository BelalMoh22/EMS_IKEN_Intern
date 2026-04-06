namespace backend.Features.TimeTrack.Projects.GetFilteredProjects
{
    public record GetProjectsQuery(int? departmentId, int? month, int? year, ProjectStatus? status) : IRequest<IEnumerable<ProjectListDto>>;
}
