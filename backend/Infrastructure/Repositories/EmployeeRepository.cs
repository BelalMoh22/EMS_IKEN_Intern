using Azure.Core;

namespace backend.Infrastructure.Repositories
{
    public class EmployeeRepository : Repository<Employee>
    {
        public EmployeeRepository(IDbConnectionFactory connectionFactory, ILogger<Repository<Employee>> logger)
            : base(connectionFactory, logger)
        {
        }

        protected override string TableName => "Employees";

        public override async Task<IEnumerable<Employee>> GetAllAsync()
        {
            var sql = @"
                SELECT e.*, u.*
                FROM Employees e
                LEFT JOIN Users u ON e.UserId = u.Id
                WHERE e.IsDeleted = 0";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<Employee, User, Employee>(sql, (e, u) => // Multiple mapping: Employee and User (QueryAsync<TFirst, TSecond, TReturn>)
            {
                e.User = u; // �Attach the User object to the Employee�
                return e;
            }, splitOn: "Id"); // splitOn: "Id" tells Dapper to split the result set on the Id column to map Employee and User correctly
        }

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
                    PositionId = @PositionId
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
            });
        }

        public async Task<Employee?> GetByUserIdAsync(int userId)
        {
            var sql = $"SELECT * FROM {TableName} WHERE UserId = @UserId AND IsDeleted = 0";
            using var connection = _connectionFactory.CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<Employee>(sql, new { UserId = userId });
        }

        public async Task<IEnumerable<Employee>> GetEmployeesByManagerIdAsync(int managerId)
        {
            var sql = $@"
                SELECT E.*, U.*
                FROM {TableName} E
                JOIN Positions P ON E.PositionId = P.Id
                JOIN Departments D ON P.DepartmentId = D.Id
                LEFT JOIN Users U ON E.UserId = U.Id
                WHERE D.Id = (
                    SELECT TOP 1 P2.DepartmentId 
                    FROM Employees E2 
                    JOIN Positions P2 ON E2.PositionId = P2.Id 
                    WHERE E2.Id = @ManagerId AND P2.IsManager = 1
                )
                AND E.IsDeleted = 0 
                AND D.IsDeleted = 0 
                AND P.IsDeleted = 0";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<Employee, User, Employee>(sql, (e, u) =>
            {
                e.User = u;
                return e;
            }, new { ManagerId = managerId });
        }

        public async Task<IEnumerable<Employee>> GetManagersByDepartmentIdAsync(int departmentId)
        {
            var sql = $@"
                SELECT e.*, u.*
                FROM Employees e
                JOIN Positions p ON e.PositionId = p.Id
                LEFT JOIN Users u ON e.UserId = u.Id
                WHERE p.DepartmentId = @DepartmentId
                  AND p.IsManager = 1
                  AND e.IsDeleted = 0
                  AND p.IsDeleted = 0";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<Employee, User, Employee>(sql, (e, u) =>
            {
                e.User = u;
                return e;
            }, new { DepartmentId = departmentId });
        }

        public async Task<IEnumerable<Employee>> GetEmployeesByDepartmentIdAsync(int departmentId)
        {
            var sql = $@"
                SELECT e.*, u.*
                FROM Employees e
                JOIN Positions p ON e.PositionId = p.Id
                LEFT JOIN Users u ON e.UserId = u.Id
                WHERE p.DepartmentId = @DepartmentId
                  AND e.IsDeleted = 0
                  AND p.IsDeleted = 0";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<Employee, User, Employee>(sql, (e, u) =>
            {
                e.User = u;
                return e;
            }, new { DepartmentId = departmentId });
        }

        public async Task<EmployeeProfileDto?> GetEmployeeProfileByUserIdAsync(int UserId)
        {
            var sql = @"
                SELECT 
                    e.Id,
                    e.FirstName,
                    e.Lastname,
                    e.NationalId,
                    e.Email,
                    e.PhoneNumber,
                    e.DateOfBirth,
                    e.Address,
                    e.Salary,
                    e.HireDate,
                    e.Status,
                    p.PositionName,
                    d.DepartmentName
                FROM Employees e
                LEFT JOIN Positions p ON e.PositionId = p.Id AND p.IsDeleted = 0
                LEFT JOIN Departments d ON p.DepartmentId = d.Id AND d.IsDeleted = 0
                WHERE e.UserId = @UserId AND e.IsDeleted = 0
            ";

            using var connection = _connectionFactory.CreateConnection();
            var profile = await connection.QuerySingleOrDefaultAsync<EmployeeProfileDto>(sql, new { UserId = UserId });
            return profile;
        }
    }
}
