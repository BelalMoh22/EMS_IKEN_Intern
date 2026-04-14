namespace backend.Features.Positions.UpdatePosition
{
    public class UpdatePositionHandler : IRequestHandler<UpdatePositionCommand, int>
    {
        private readonly IRepository<Position> _repo;
        private readonly IPositionBusinessRules _rules;

        public UpdatePositionHandler(IRepository<Position> repo, IPositionBusinessRules rules)
        {
            _repo = repo;
            _rules = rules;
        }

        public async Task<int> Handle(UpdatePositionCommand request, CancellationToken cancellationToken)
        {
            if (request.Id <= 0)
                throw new Exceptions.ValidationException(new Dictionary<string, List<string>> { { "id", new List<string> { "Id must be a positive integer." } } });

            var existingPosition = await _repo.GetByIdAsync(request.Id);
            if (existingPosition == null)
                throw new NotFoundException($"Position with Id {request.Id} not found.");

            var dto = request.dto;
            await _rules.ValidateForUpdateAsync(request.Id, dto, existingPosition);

            existingPosition.Update(dto.PositionName,dto.MinSalary,dto.MaxSalary,dto.DepartmentId, dto.TargetEmployeeCount, dto.IsManager);

            return await _repo.UpdateAsync(request.Id, existingPosition);
        }
    }
}
