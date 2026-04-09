
using backend.Infrastructure.BusinessRules.WorkLogs;

namespace backend.Features.TimeTrack.WorkLogs.DeleteWorkLog
{
    public class DeleteWorkLogHandler : IRequestHandler<DeleteWorkLogCommand, bool>
    {
        private readonly IWorkLogRepository _repo;
        private readonly EmployeeRepository _employeeRepo;
        private readonly IWorkLogBusinessRules _rules;
        private readonly ICurrentUserService _currentUser;

        public DeleteWorkLogHandler(
            IWorkLogRepository repo,
            EmployeeRepository employeeRepo,
            IWorkLogBusinessRules rules,
            ICurrentUserService currentUser)
        {
            _repo = repo;
            _employeeRepo = employeeRepo;
            _rules = rules;
            _currentUser = currentUser;
        }
        public async Task<bool> Handle(DeleteWorkLogCommand request, CancellationToken cancellationToken)
        {
            var employee = await _employeeRepo.GetByUserIdAsync(_currentUser.UserId);
            if (employee == null) 
                throw new Exception("Employee not found.");

            var existing = await _rules.CheckWorkLogExistsAsync(request.WorkLogId);

            await _rules.ValidateForDeleteAsync(employee.Id, existing);

            var rows = await _repo.SoftDeleteLogAsync(request.WorkLogId);

            return rows > 0;
        }
    }
}
