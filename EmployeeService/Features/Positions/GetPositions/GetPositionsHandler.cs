namespace EmployeeService.Features.Positions.GetPositions
{
    using EmployeeService.Features.Positions;
    public class GetPositionsHandler : IRequestHandler<GetPositionsQuery, IEnumerable<PositionDto>>
    {
        private readonly IRepository<Position> _repo;

        public GetPositionsHandler(IRepository<Position> repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<PositionDto>> Handle(GetPositionsQuery request, CancellationToken cancellationToken)
        {
            var positions = await _repo.GetAllAsync();
            return positions.Select(p => new PositionDto
            {
                Id = p.Id,
                PositionName = p.PositionName,
                MinSalary = p.MinSalary,
                MaxSalary = p.MaxSalary,
                DepartmentId = p.DepartmentId,
                TargetEmployeeCount = p.TargetEmployeeCount,
                CurrentEmployeeCount = p.CurrentEmployeeCount
            });
        }
    }
}
