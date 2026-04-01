namespace EmployeeService.Features.Positions.GetPositions
{
    using EmployeeService.Domain.Models;
    public class GetPositionsHandler : IRequestHandler<GetPositionsQuery, IEnumerable<Position>>
    {
        private readonly IRepository<Position> _repo;
        private readonly IRepository<Employee> _employeeRepo;

        public GetPositionsHandler(IRepository<Position> repo, IRepository<Employee> employeeRepo)
        {
            _repo = repo;
            _employeeRepo = employeeRepo;
        }

        public async Task<IEnumerable<Position>> Handle(GetPositionsQuery request, CancellationToken cancellationToken)
        {
            if (request.UserRole == Roles.HR.ToString())
            {
                return await _repo.GetAllAsync();
            }

            if (request.UserRole == Roles.Manager.ToString())
            {
                if (_repo is PositionRepository posRepo && _employeeRepo is EmployeeRepository empRepo)
                {
                    var manager = await empRepo.GetByUserIdAsync(request.UserId);
                    if (manager == null) return Enumerable.Empty<Position>();

                    return await posRepo.GetByManagerIdAsync(manager.Id);
                }
            }

            return Enumerable.Empty<Position>();
        }
    }
}
