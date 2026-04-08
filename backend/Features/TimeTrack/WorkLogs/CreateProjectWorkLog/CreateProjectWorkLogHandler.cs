
using backend.Domain.Models;
using backend.Infrastructure.BusinessRules.WorkLogs;

namespace backend.Features.TimeTrack.WorkLogs.CreateProjectWorkLog
{
    public class CreateProjectWorkLogHandler : IRequestHandler<CreateProjectWorkLogCommand, int>
    {
        private readonly IWorkLogRepository _repo;
        private readonly IWorkLogBusinessRules _rules;
        private readonly ICurrentUserService _currentUser;

        public CreateProjectWorkLogHandler(
            IWorkLogRepository repo,
            IWorkLogBusinessRules rules,
            ICurrentUserService currentUser)
        {
            _repo = repo;
            _rules = rules;
            _currentUser = currentUser;
        }

        public async Task<int> Handle(CreateProjectWorkLogCommand request, CancellationToken cancellationToken)
        {
            var employeeId = _currentUser.UserId;

            var dto = request.Dto;

            await _rules.ValidateForCreateAsync(employeeId, new CreateWorkLogDTO
            {
                ProjectId = dto.ProjectId,
                WorkDate = dto.WorkDate,
                Hours = dto.Hours,
                Notes = dto.Notes
            });

            var workLog = new WorkLog(
                employeeId,
                dto.ProjectId,
                dto.WorkDate,
                dto.Hours,
                WorkStatus.Todo,
                dto.Notes
            );

            var id = await _repo.CreateAsync(workLog);

            return id;
        }
    }
}
