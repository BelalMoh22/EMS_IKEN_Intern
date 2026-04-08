
using backend.Infrastructure.BusinessRules.WorkLogs;

namespace backend.Features.TimeTrack.WorkLogs.DeleteWorkLog
{
    public class DeleteWorkLogHandler : IRequestHandler<DeleteWorkLogCommand, bool>
    {
        private readonly IWorkLogRepository _repo;
        private readonly IWorkLogBusinessRules _rules;
        private readonly ICurrentUserService _currentUser;

        public DeleteWorkLogHandler(
            IWorkLogRepository repo,
            IWorkLogBusinessRules rules,
            ICurrentUserService currentUser)
        {
            _repo = repo;
            _rules = rules;
            _currentUser = currentUser;
        }
        public async Task<bool> Handle(DeleteWorkLogCommand request, CancellationToken cancellationToken)
        {
            var employeeId = _currentUser.UserId;

            var existing = await _rules.CheckWorkLogExistsAsync(request.WorkLogId);

            await _rules.ValidateForDeleteAsync(employeeId, existing);

            var rows = await _repo.SoftDeleteLogAsync(request.WorkLogId);

            return rows > 0;
        }
    }
}
