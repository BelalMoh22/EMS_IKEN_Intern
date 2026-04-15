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
                (DepartmentName, Description)
            VALUES
                (@DepartmentName , @Description);

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
                IsActive = @IsActive
                WHERE Id = @Id
            ";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.ExecuteAsync(sql, new
            {
                Id = id,
                department.DepartmentName,
                department.Description,
                department.IsActive
            });
        }


        public async Task<Department?> GetByManagerIdAsync(int managerId)
        {
            var sql = $@"
                SELECT D.* 
                FROM Departments D
                JOIN Positions P ON D.Id = P.DepartmentId
                JOIN Employees E ON P.Id = E.PositionId
                WHERE E.Id = @ManagerId 
                  AND P.IsManager = 1
                  AND D.IsDeleted = 0";
            using var connection = _connectionFactory.CreateConnection();
            var department = await connection.QuerySingleOrDefaultAsync<Department>(sql, new { ManagerId = managerId });
            return department;
        }

        public async Task<Department?> GetDepartmentByEmployeeIdAsync(int employeeId)
        {
            var sql = $@"
                SELECT D.*
                FROM Departments D
                JOIN Positions P ON D.Id = P.DepartmentId
                JOIN Employees E ON P.Id = E.PositionId
                WHERE E.Id = @EmployeeId
                  AND D.IsDeleted = 0";
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<Department>(sql, new { EmployeeId = employeeId });
        }


        public override async Task<int> DeleteAsync(int id)
        {
            return await SoftDeleteAsync(id);
        }
    }
}