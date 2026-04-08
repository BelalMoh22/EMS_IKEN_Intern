namespace backend.Features.TimeTrack.WorkLogs.UpdateProjectWorkLog
{
    public class UpdateProjectWorkLogHandler : IRequestHandler<UpdateProjectWorkLogCommand, WorkLogResponseItemDTO>
    {
        private readonly IWorkLogRepository _workLogRepo;
        private readonly EmployeeRepository _employeeRepo;
        private readonly IWorkLogBusinessRules _rules;
        private readonly ICurrentUserService _currentUser;

        public UpdateProjectWorkLogHandler(
            IWorkLogRepository workLogRepo,
            EmployeeRepository employeeRepo,
            IWorkLogBusinessRules rules,
            ICurrentUserService currentUser)
        {
            _workLogRepo = workLogRepo;
            _employeeRepo = employeeRepo;
            _rules = rules;
            _currentUser = currentUser;
        }

        public async Task<WorkLogResponseItemDTO> Handle(UpdateProjectWorkLogCommand request, CancellationToken cancellationToken)
        {
            ValidationHelper.ValidateModel(request.Dto);

            var employee = await _employeeRepo.GetByUserIdAsync(_currentUser.UserId);
            if (employee == null) throw new Exception("Employee not found.");

            var existing = await _rules.CheckWorkLogExistsAsync(request.Id);

            await _rules.ValidateForUpdateAsync(employee.Id, request.Id, request.Dto, existing);

            existing.Update(
                request.Dto.Hours ?? existing.Hours,
                request.Dto.Status ?? existing.Status,
                request.Dto.Notes ?? existing.Notes
            );

            await _workLogRepo.UpdateAsync(existing);

            return new WorkLogResponseItemDTO
            {
                Id = existing.Id,
                ProjectId = existing.ProjectId,
                Hours = existing.Hours,
                Status = existing.Status,
                Notes = existing.Notes
            };
        }
    }
}
