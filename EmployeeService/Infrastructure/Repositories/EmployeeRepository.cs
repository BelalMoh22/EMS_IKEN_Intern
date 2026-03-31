namespace EmployeeService.Infrastructure.Repositories
{
    public class EmployeeRepository : Repository<Employee>
    {
        public EmployeeRepository(IDbConnectionFactory connectionFactory,ILogger<Repository<Employee>> logger)
            : base(connectionFactory, logger)
        {
        }

        protected override string TableName => "Employees";

        public override async Task<int> AddAsync(Employee employee)
        {
            var sql = $@"
                INSERT INTO {TableName}
                (
                    FirstName,
                    Lastname,
                    NationalId,
                    Email,
                    PhoneNumber,
                    DateOfBirth,
                    Address,
                    Salary,
                    HireDate,
                    Status,
                    PositionId,
                    UserId,
                    WorkStartHour,
                    IsDeleted
                )
                VALUES
                (
                    @FirstName,
                    @Lastname,
                    @NationalId,
                    @Email,
                    @PhoneNumber,
                    @DateOfBirth,
                    @Address,
                    @Salary,
                    @HireDate,
                    @Status,
                    @PositionId,
                    @UserId,
                    @WorkStartHour,
                    @IsDeleted
                );

                SELECT CAST(SCOPE_IDENTITY() AS INT);
            ";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.ExecuteScalarAsync<int>(sql, employee);
        }

        public override async Task<int> UpdateAsync(int id, Employee employee)
        {
            var sql = $@"
                UPDATE {TableName}
                SET
                    FirstName = @FirstName,
                    Lastname = @Lastname,
                    NationalId = @NationalId,
                    Email = @Email,
                    PhoneNumber = @PhoneNumber,
                    DateOfBirth = @DateOfBirth,
                    Address = @Address,
                    Salary = @Salary,
                    HireDate = @HireDate,
                    Status = @Status,
                    PositionId = @PositionId,
                    WorkStartHour = @WorkStartHour
                WHERE Id = @Id
            ";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.ExecuteAsync(sql, new
            {
                Id = id,
                employee.FirstName,
                employee.Lastname,
                employee.NationalId,
                employee.Email,
                employee.PhoneNumber,
                employee.DateOfBirth,
                employee.Address,
                employee.Salary,
                employee.HireDate,
                employee.Status,
                employee.PositionId,
                employee.WorkStartHour
            });
        }

        public async Task<Employee?> GetByUserIdAsync(int userId)
        {
            var sql = $"SELECT * FROM {TableName} WHERE UserId = @UserId AND IsDeleted = 0";
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<Employee>(sql, new { UserId = userId });
        }
    }
}
