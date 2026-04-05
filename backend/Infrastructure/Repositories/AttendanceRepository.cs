namespace backend.Infrastructure.Repositories
{
    public class AttendanceRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;
        private readonly ILogger<AttendanceRepository> _logger;

        public AttendanceRepository(IDbConnectionFactory connectionFactory, ILogger<AttendanceRepository> logger)
        {
            _connectionFactory = connectionFactory;
            _logger = logger;
        }


        public async Task<bool> ExistsByEmployeeAndDateAsync(int employeeId, DateTime date)
        {
            const string sql = @"
                SELECT COUNT(1)
                FROM Attendance
                WHERE EmployeeId = @EmployeeId
                  AND CAST(Date AS DATE) = CAST(@Date AS DATE)";

            _logger.LogDebug("Checking duplicate attendance for EmployeeId {EmployeeId} on {Date}", employeeId, date.Date);

            using var connection = _connectionFactory.CreateConnection();
            var count = await connection.ExecuteScalarAsync<int>(sql, new { EmployeeId = employeeId, Date = date.Date });
            return count > 0;
        } // Check if attendance already exists for an employee on a specific day : Employee shouldn’t check-in twice in same day ❌

        public async Task<Attendance?> GetByEmployeeAndDateAsync(int employeeId, DateTime date)
        {
            const string sql = @"
                SELECT Id, EmployeeId, Date, CheckIn, CheckOut, LateMinutes, EarlyLeaveMinutes, WorkingMinutes, Status, CreatedAt
                FROM Attendance
                WHERE EmployeeId = @EmployeeId
                  AND CAST(Date AS DATE) = CAST(@Date AS DATE)";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryFirstOrDefaultAsync<Attendance>(sql, new { EmployeeId = employeeId, Date = date.Date });
        } // Get attendance record for a specific employee on a specific date

        public async Task<IEnumerable<Attendance>> GetByEmployeeIdAsync(int employeeId)
        {
            const string sql = @"
                SELECT Id, EmployeeId, Date, CheckIn, CheckOut, LateMinutes, EarlyLeaveMinutes, WorkingMinutes, Status, CreatedAt
                FROM Attendance
                WHERE EmployeeId = @EmployeeId
                ORDER BY Date DESC";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<Attendance>(sql, new { EmployeeId = employeeId });
        } // Get all attendance records for a specific employee, ordered by date descending

        public async Task InsertAsync(Attendance record)
        {
            const string sql = @"
                INSERT INTO Attendance (EmployeeId, Date, CheckIn, CheckOut, LateMinutes, EarlyLeaveMinutes, WorkingMinutes, Status, CreatedAt)
                VALUES (@EmployeeId, @Date, @CheckIn, @CheckOut, @LateMinutes, @EarlyLeaveMinutes, @WorkingMinutes, @Status, @CreatedAt)";

            using var connection = _connectionFactory.CreateConnection();
            await connection.ExecuteAsync(sql, record);
            _logger.LogInformation("Inserted attendance record for EmployeeId {EmployeeId} on {Date}.", record.EmployeeId, record.Date);
        } // Insert a new attendance record

        public async Task UpdateAsync(int id, Attendance record)
        {
            const string sql = @"
                UPDATE Attendance
                SET CheckIn = @CheckIn,
                    CheckOut = @CheckOut,
                    LateMinutes = @LateMinutes,
                    EarlyLeaveMinutes = @EarlyLeaveMinutes,
                    WorkingMinutes = @WorkingMinutes,
                    Status = @Status
                WHERE Id = @Id";

            using var connection = _connectionFactory.CreateConnection();
            await connection.ExecuteAsync(sql, new
            {
                Id = id,
                record.CheckIn,
                record.CheckOut,
                record.LateMinutes,
                record.EarlyLeaveMinutes,
                record.WorkingMinutes,
                record.Status
            });
            _logger.LogInformation("Updated attendance record Id {Id}.", id);
        } // Update an existing attendance record by its ID

        public async Task<IEnumerable<Attendance>> GetFilteredAttendanceAsync(int? employeeId, int? year, int? month, int? day)
        {
            var sql = new StringBuilder(@"
                SELECT Id, EmployeeId, Date, CheckIn, CheckOut, LateMinutes, EarlyLeaveMinutes, WorkingMinutes, Status, CreatedAt
                FROM Attendance
                WHERE 1=1 ");

            var parameters = new DynamicParameters();

            if (employeeId.HasValue)
            {
                sql.Append(" AND EmployeeId = @EmployeeId ");
                parameters.Add("EmployeeId", employeeId.Value);
            }

            if (year.HasValue)
            {
                sql.Append(" AND YEAR(Date) = @Year ");
                parameters.Add("Year", year.Value);
            }

            if (month.HasValue)
            {
                sql.Append(" AND MONTH(Date) = @Month ");
                parameters.Add("Month", month.Value);
            }

            if (day.HasValue)
            {
                sql.Append(" AND DAY(Date) = @Day ");
                parameters.Add("Day", day.Value);
            }

            sql.Append(" ORDER BY Date DESC ");

            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<Attendance>(sql.ToString(), parameters);
        } // Get attendance with optional filters: employeeId, year, month, day
    }
}

