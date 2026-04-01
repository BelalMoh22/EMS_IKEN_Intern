namespace EmployeeService.Features.Positions.DeletePosition
{
    public class DeletePositionHandler : IRequestHandler<DeletePositionCommand, int>
    {
        private readonly IRepository<Position> _repo;
        private readonly IPositionBusinessRules _rules;
        private readonly IDbConnectionFactory _connectionFactory;

        public DeletePositionHandler(
            IRepository<Position> repo,
            IPositionBusinessRules rules,
            IDbConnectionFactory connectionFactory)
        {
            _repo = repo;
            _rules = rules;
            _connectionFactory = connectionFactory;
        }

        public async Task<int> Handle(DeletePositionCommand request, CancellationToken cancellationToken)
        {
            if (request.id <= 0)
                throw new Exceptions.ValidationException(new Dictionary<string, List<string>>
                {
                    { "id", new List<string> { "Id must be a positive integer." } }
                });

            await _rules.ValidateForDeleteAsync(request.id);

            using var connection = _connectionFactory.CreateConnection();
            connection.Open();

            using var transaction = connection.BeginTransaction();
            try
            {
                // Soft-delete employees assigned to this position first.
                var softDeleteEmployeesSql = @"
UPDATE Employees
SET IsDeleted = 1
WHERE PositionId = @PositionId AND IsDeleted = 0;";

                await connection.ExecuteAsync(
                    softDeleteEmployeesSql,
                    new { PositionId = request.id },
                    transaction
                );

                // Soft-delete position.
                var softDeletePositionSql = @"
UPDATE Positions
SET IsDeleted = 1
WHERE Id = @Id AND IsDeleted = 0;";

                var rows = await connection.ExecuteAsync(
                    softDeletePositionSql,
                    new { Id = request.id },
                    transaction
                );

                if (rows == 0)
                    throw new NotFoundException($"Position with Id {request.id} not found.");

                transaction.Commit();
                return rows;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
