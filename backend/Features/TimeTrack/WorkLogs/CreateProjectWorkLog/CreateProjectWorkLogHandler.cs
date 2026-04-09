
using backend.Domain.Models;
using backend.Infrastructure.BusinessRules.WorkLogs;

namespace backend.Features.TimeTrack.WorkLogs.CreateProjectWorkLog
{
    public class CreateProjectWorkLogHandler : IRequestHandler<CreateProjectWorkLogCommand, int>
    {
        private readonly IWorkLogRepository _repo;
        private readonly EmployeeRepository _employeeRepo;
        private readonly IWorkLogBusinessRules _rules;
        private readonly ICurrentUserService _currentUser;

        public CreateProjectWorkLogHandler(
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

        public async Task<int> Handle(CreateProjectWorkLogCommand request, CancellationToken cancellationToken)
        {
            var employee = await _employeeRepo.GetByUserIdAsync(_currentUser.UserId);
            if (employee == null) 
                throw new Exception("Employee not found.");

            var dto = request.Dto;

            await _rules.EnsureProjectNotLoggedForDayAsync(employee.Id, dto.ProjectId, dto.WorkDate);

            await _rules.ValidateForCreateAsync(employee.Id, new CreateWorkLogDTO
            {
                ProjectId = dto.ProjectId,
                WorkDate = dto.WorkDate,
                Hours = dto.Hours,
                Notes = dto.Notes,
                Status = WorkStatus.Todo
            });

            var workLog = new WorkLog(
                employee.Id,
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
