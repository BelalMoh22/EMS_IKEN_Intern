namespace backend.Features.TimeTrack.WorkLogs.GetEmployeReport
{
    public class GetEmployeeReportHandler : IRequestHandler<GetEmployeReportQuery, IEnumerable<EmployeeDailyReportDTO>>
    {
        private readonly IWorkLogRepository _workLogRepo;

        public GetEmployeeReportHandler(IWorkLogRepository workLogRepo)
        {
            _workLogRepo = workLogRepo;
        }

        public async Task<IEnumerable<EmployeeDailyReportDTO>> Handle(GetEmployeReportQuery request, CancellationToken cancellationToken)
        {
            return await _workLogRepo.GetEmployeeProjectReportAsync(request.ProjectId, request.EmployeeId);
        }
    }
}