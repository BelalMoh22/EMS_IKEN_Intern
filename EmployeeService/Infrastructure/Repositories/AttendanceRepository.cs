using System.Text;
using Dapper;

namespace EmployeeService.Infrastructure.Repositories
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

        /// <summary>
        /// Checks whether an attendance record already exists for the given employee on the given date.
        /// </summary>
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
        }

        /// Gets an existing attendance record for one employee on one date. Returns null if not found.
        public async Task<Attendance?> GetByEmployeeAndDateAsync(int employeeId, DateTime date)
        {
            const string sql = @"
                SELECT Id, EmployeeId, Date, CheckIn, CheckOut, LateMinutes, EarlyLeaveMinutes, WorkingMinutes, Status, CreatedAt
                FROM Attendance
                WHERE EmployeeId = @EmployeeId
                  AND CAST(Date AS DATE) = CAST(@Date AS DATE)";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryFirstOrDefaultAsync<Attendance>(sql, new { EmployeeId = employeeId, Date = date.Date });
        }

        /// <summary>
        /// Gets all attendance records for an employee, ordered by date descending.
        /// </summary>
        public async Task<IEnumerable<Attendance>> GetByEmployeeIdAsync(int employeeId)
        {
            const string sql = @"
                SELECT Id, EmployeeId, Date, CheckIn, CheckOut, LateMinutes, EarlyLeaveMinutes, WorkingMinutes, Status, CreatedAt
                FROM Attendance
                WHERE EmployeeId = @EmployeeId
                ORDER BY Date DESC";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<Attendance>(sql, new { EmployeeId = employeeId });
        }

        /// <summary>
        /// Inserts a single attendance record.
        /// </summary>
        public async Task InsertAsync(Attendance record)
        {
            const string sql = @"
                INSERT INTO Attendance (EmployeeId, Date, CheckIn, CheckOut, LateMinutes, EarlyLeaveMinutes, WorkingMinutes, Status, CreatedAt)
                VALUES (@EmployeeId, @Date, @CheckIn, @CheckOut, @LateMinutes, @EarlyLeaveMinutes, @WorkingMinutes, @Status, @CreatedAt)";

            using var connection = _connectionFactory.CreateConnection();
            await connection.ExecuteAsync(sql, record);
            _logger.LogInformation("Inserted attendance record for EmployeeId {EmployeeId} on {Date}.", record.EmployeeId, record.Date);
        }

        /// <summary>
        /// Updates an existing attendance record by Id.
        /// </summary>
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
        }

        /// <summary>
        /// Gets attendance records with optional filtering by EmployeeId, Year, Month, and Day.
        /// </summary>
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
        }

        public async Task BulkInsertAsync(IEnumerable<Attendance> records)
        {
            const string sql = @"
                INSERT INTO Attendance (EmployeeId, Date, CheckIn, CheckOut, LateMinutes, EarlyLeaveMinutes, WorkingMinutes, Status, CreatedAt)
                VALUES (@EmployeeId, @Date, @CheckIn, @CheckOut, @LateMinutes, @EarlyLeaveMinutes, @WorkingMinutes, @Status, @CreatedAt)";

            using var connection = _connectionFactory.CreateConnection();
            connection.Open();
            using var tx = connection.BeginTransaction();
            try
            {
                await connection.ExecuteAsync(sql, records, tx);
                tx.Commit();
                _logger.LogInformation("Bulk-inserted {Count} attendance records.", records.Count());
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }
    }
}

