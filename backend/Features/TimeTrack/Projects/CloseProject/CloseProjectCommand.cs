namespace backend.Features.TimeTrack.Projects.CloseProject
{
    public record CloseProjectCommand(int ProjectId) : IRequest<Unit>; // Unit : This operation returns nothing(void)
}
