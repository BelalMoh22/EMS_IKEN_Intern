namespace EmployeeService.Features.Departments.DeleteDepartment
{
    public class DeleteDepartmentHandler : IRequestHandler<DeleteDepartmentCommand, int>
    {
        private readonly IRepository<Department> _repo;
        private readonly IDepartmentBusinessRules _rules;
        private readonly IDbConnectionFactory _connectionFactory;

        public DeleteDepartmentHandler(
            IRepository<Department> repo,
            IDepartmentBusinessRules rules,
            IDbConnectionFactory connectionFactory)
        {
            _repo = repo;
            _rules = rules;
            _connectionFactory = connectionFactory;
        }

        public async Task<int> Handle(DeleteDepartmentCommand request, CancellationToken cancellationToken)
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
                // Soft-delete positions under this department first.
                var softDeletePositionsSql = @"
                    UPDATE Positions
                    SET IsDeleted = 1
                    WHERE DepartmentId = @DepartmentId AND IsDeleted = 0;";

                await connection.ExecuteAsync(
                    softDeletePositionsSql,
                    new { DepartmentId = request.id },
                    transaction
                );

                // Soft-delete department.
                var softDeleteDepartmentSql = @"
                    UPDATE Departments
                    SET IsDeleted = 1
                    WHERE Id = @Id AND IsDeleted = 0;";

                var rows = await connection.ExecuteAsync(
                    softDeleteDepartmentSql,
                    new { Id = request.id },
                    transaction
                );

                if (rows == 0)
                    throw new NotFoundException($"Department with Id {request.id} not found.");

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
