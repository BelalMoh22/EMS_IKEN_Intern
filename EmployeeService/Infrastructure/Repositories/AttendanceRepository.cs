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

        /// <summary>
        /// Bulk-inserts confirmed attendance records inside a single transaction.
        /// </summary>
        public async Task BulkInsertAsync(IEnumerable<Attendance> records)
        {
            const string sql = @"
                INSERT INTO Attendance (EmployeeId, Date, CheckIn, CheckOut, LateMinutes, Status, CreatedAt)
                VALUES (@EmployeeId, @Date, @CheckIn, @CheckOut, @LateMinutes, @Status, @CreatedAt)";

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
