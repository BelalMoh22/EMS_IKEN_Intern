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
                (PositionName, MinSalary, MaxSalary, DepartmentId)
            VALUES
                (@PositionName, @MinSalary, @MaxSalary, @DepartmentId);

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
                DepartmentId = @DepartmentId
            WHERE Id = @Id
        ";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.ExecuteAsync(sql, new
            {
                Id = id,
                position.PositionName,
                position.MinSalary,
                position.MaxSalary,
                position.DepartmentId
            });
        }
    }

}
