namespace backend.Infrastructure.Repositories
{
    public class DepartmentRepository : Repository<Department>
    {
        public DepartmentRepository(IDbConnectionFactory connectionFactory,ILogger<Repository<Department>> logger)
            : base(connectionFactory, logger)
        {}
        protected override string TableName => "Departments";

        public override async Task<int> AddAsync(Department department)
        {
            var sql = $@"
            INSERT INTO {TableName}
                (DepartmentName, Description, ManagerId)
            VALUES
                (@DepartmentName , @Description , @ManagerId);

            SELECT CAST(SCOPE_IDENTITY() as int)
        ;";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.ExecuteScalarAsync<int>(sql, department);
        }

        public override async Task<int> UpdateAsync(int id, Department department)
        {
            var sql = $@"
            UPDATE {TableName}
            SET
                DepartmentName = @DepartmentName,
                Description = @Description,
                ManagerId = @ManagerId,
                IsActive = @IsActive
                WHERE Id = @Id
            ";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.ExecuteAsync(sql, new
            {
                Id = id,
                department.DepartmentName,
                department.Description,
                department.ManagerId,
                department.IsActive
            });
        }


        public async Task<Department?> GetByManagerIdAsync(int managerId)
        {
            var sql = $@"SELECT * FROM {TableName} WHERE ManagerId = @ManagerId";
            using var connection = _connectionFactory.CreateConnection();
            var department = await connection.QuerySingleOrDefaultAsync<Department>(sql, new { ManagerId = managerId });
            return department;
        }

        public override async Task<int> DeleteAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            connection.Open();
            using var transaction = connection.BeginTransaction();
            try
            {
                // Soft-delete employees under positions belonging to this department.
                var softDeleteEmployeesSql = @"
                    UPDATE Employees 
                    SET IsDeleted = 1 
                    WHERE PositionId IN (
                        SELECT Id FROM Positions WHERE DepartmentId = @DepartmentId AND IsDeleted = 0
                    ) AND IsDeleted = 0;";

                await connection.ExecuteAsync(
                    softDeleteEmployeesSql,
                    new { DepartmentId = id },
                    transaction
                );

                // Soft-delete positions under this department.
                var softDeletePositionsSql = @"
                    UPDATE Positions 
                    SET IsDeleted = 1 
                    WHERE DepartmentId = @DepartmentId AND IsDeleted = 0;";

                await connection.ExecuteAsync(
                    softDeletePositionsSql,
                    new { DepartmentId = id },
                    transaction
                );

                // Soft-delete the department.
                var softDeleteDepartmentSql = $@"
                    UPDATE {TableName} 
                    SET IsDeleted = 1 
                    WHERE Id = @Id AND IsDeleted = 0;";

                var rows = await connection.ExecuteAsync(
                    softDeleteDepartmentSql,
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
    }
}