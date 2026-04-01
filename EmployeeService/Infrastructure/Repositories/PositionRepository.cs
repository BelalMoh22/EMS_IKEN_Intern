namespace EmployeeService.Infrastructure.Repositories
{
    public class PositionRepository : Repository<Position>
    {
        public PositionRepository(IDbConnectionFactory connectionFactory,ILogger<Repository<Position>> logger): base(connectionFactory, logger)
        {
        }

        protected override string TableName => "Positions";

        public override async Task<int> AddAsync(Position position)
        {
            var sql = $@"
            INSERT INTO {TableName}
                (PositionName, MinSalary, MaxSalary, DepartmentId, TargetEmployeeCount)
            VALUES
                (@PositionName, @MinSalary, @MaxSalary, @DepartmentId, @TargetEmployeeCount);

            SELECT CAST(SCOPE_IDENTITY() AS INT);
            ";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.ExecuteScalarAsync<int>(sql, position);
        }

        public override async Task<int> UpdateAsync(int id, Position position)
        {
            var sql = $@"
            UPDATE {TableName}
            SET
                PositionName = @PositionName,
                MinSalary = @MinSalary,
                MaxSalary = @MaxSalary,
                DepartmentId = @DepartmentId,
                TargetEmployeeCount = @TargetEmployeeCount
            WHERE Id = @Id
        ";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.ExecuteAsync(sql, new
            {
                Id = id,
                position.PositionName,
                position.MinSalary,
                position.MaxSalary,
                position.DepartmentId,
                position.TargetEmployeeCount
            });
        }

        public override async Task<int> DeleteAsync(int id)
        {
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
                    new { PositionId = id },
                    transaction
                );

                // Soft-delete position.
                var softDeletePositionSql = $@"
                    UPDATE {TableName} 
                    SET IsDeleted = 1 
                    WHERE Id = @Id AND IsDeleted = 0;";

                var rows = await connection.ExecuteAsync(
                    softDeletePositionSql,
                    new { Id = id },
                    transaction
                );

                transaction.Commit();
                return rows;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
        public async Task<IEnumerable<Position>> GetByManagerIdAsync(int managerId)
        {
            var sql = $@"
                SELECT P.*
                FROM Positions P
                JOIN Departments D ON P.DepartmentId = D.Id
                WHERE D.ManagerId = @ManagerId AND P.IsDeleted = 0 AND D.IsDeleted = 0";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<Position>(sql, new { ManagerId = managerId });
        }
    }
}
