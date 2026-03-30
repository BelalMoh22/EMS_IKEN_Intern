namespace EmployeeService.Infrastructure.Repositories
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
                (DepartmentName,Description, Email, ManagerId)
            VALUES
                (@DepartmentName , @Description , @Email, @ManagerId);

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
    }
}