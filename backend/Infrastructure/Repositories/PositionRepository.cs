namespace backend.Infrastructure.Repositories
{
    public class PositionRepository : Repository<Position>
    {
        public PositionRepository(IDbConnectionFactory connectionFactory,ILogger<Repository<Position>> logger): base(connectionFactory, logger)
        {
        }

        protected override string TableName => "Positions";

        public override async Task<IEnumerable<Position>> GetAllAsync()
        {
            var sql = @"
                SELECT p.*, d.DepartmentName
                FROM Positions p
                JOIN Departments d ON p.DepartmentId = d.Id
                WHERE p.IsDeleted = 0 AND d.IsDeleted = 0";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<Position>(sql);
        }

        public override async Task<Position?> GetByIdAsync(int id)
        {
            var sql = @"
                SELECT p.*, d.DepartmentName
                FROM Positions p
                JOIN Departments d ON p.DepartmentId = d.Id
                WHERE p.Id = @Id";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryFirstOrDefaultAsync<Position>(sql, new { Id = id });
        }

        public override async Task<int> AddAsync(Position position)
        {
            var sql = $@"
            INSERT INTO {TableName}
                (PositionName, MinSalary, MaxSalary, DepartmentId, TargetEmployeeCount, IsManager)
            VALUES
                (@PositionName, @MinSalary, @MaxSalary, @DepartmentId, @TargetEmployeeCount, @IsManager);

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
                TargetEmployeeCount = @TargetEmployeeCount,
                IsManager = @IsManager
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
                position.TargetEmployeeCount,
                position.IsManager
            });
        }

        public override async Task<int> DeleteAsync(int id)
        {
            return await SoftDeleteAsync(id);
        }

    }
}
