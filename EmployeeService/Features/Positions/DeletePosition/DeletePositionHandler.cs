namespace EmployeeService.Features.Positions.DeletePosition
{
    public class DeletePositionHandler : IRequestHandler<DeletePositionCommand, int>
    {
        private readonly IRepository<Position> _repo;
        private readonly IPositionBusinessRules _rules;

        public DeletePositionHandler(IRepository<Position> repo , IPositionBusinessRules rules)
        {
            _repo = repo;
            _rules = rules;
        }

        public async Task<int> Handle(DeletePositionCommand request, CancellationToken cancellationToken)
        {
            if (request.id <= 0)
                throw new Exceptions.ValidationException(new Dictionary<string, List<string>>
                {
                    { "id", new List<string> { "Id must be a positive integer." } }
                });

            await _rules.ValidateForDeleteAsync(request.id);
            var rows = await _repo.DeleteAsync(request.id);
            if (rows == 0)
                throw new NotFoundException($"Position with Id {request.id} not found.");

            return rows;
        }
    }
}
