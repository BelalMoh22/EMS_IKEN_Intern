namespace EmployeeService.Features.Employees.GetEmployeeByUserId
{
    public class GetEmployeeByUserIdHandler : IRequestHandler<GetEmployeeByUserIdQuery, EmployeeProfileDto?>
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public GetEmployeeByUserIdHandler(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<EmployeeProfileDto?> Handle(GetEmployeeByUserIdQuery request, CancellationToken cancellationToken)
        {
            if (request.UserId <= 0)
                throw new Exceptions.ValidationException(new Dictionary<string, List<string>>
                {
                    { "id", new List<string> { "Id must be a positive integer." } }
                });

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
            var profile = await connection.QuerySingleOrDefaultAsync<EmployeeProfileDto>(sql, new { UserId = request.UserId });

            if (profile == null)
                throw new NotFoundException($"Employee with UserId {request.UserId} not found.");

            return profile;
        }
    }
}
