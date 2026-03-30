namespace EmployeeService.Features.Positions.CreatePosition
{
    public class CreatePositionHandler : IRequestHandler<CreatePositionCommand, int>
    {
        private readonly IRepository<Position> _repo;
        private readonly IPositionBusinessRules _rules;

        public CreatePositionHandler(IRepository<Position> repo, IPositionBusinessRules rules)
        {
            _repo = repo;
            _rules = rules;
        }

        public async Task<int> Handle(CreatePositionCommand request, CancellationToken cancellationToken)
        {
            var dto = request.dto;

            if (dto is null)
                throw new Exceptions.ValidationException(new Dictionary<string, List<string>>
                {
                    { "dto", new List<string> { "Position data cannot be null." } }
                });

            await _rules.ValidateForCreateAsync(dto);

            var Position = new Position(dto.PositionName,dto.MinSalary,dto.MaxSalary,dto.DepartmentId, dto.TargetEmployeeCount);

            return await _repo.AddAsync(Position);
        }
    }
}
