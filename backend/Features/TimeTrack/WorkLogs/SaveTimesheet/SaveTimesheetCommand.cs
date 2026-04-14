namespace backend.Features.TimeTrack.WorkLogs.SaveTimesheet
{
    public record SaveTimesheetCommand(SaveTimesheetDTO Dto) : IRequest<bool>;
}
