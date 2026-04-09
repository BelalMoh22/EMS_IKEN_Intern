namespace backend.Infrastructure.Repositories
{
    public class WorkLogRepository : IWorkLogRepository
    {
        private readonly IDbConnectionFactory _db;

        public WorkLogRepository(IDbConnectionFactory db)
        {
            _db = db;
        }

        // =========================
        // Daily Mode (TABLE VIEW)
        // =========================
        public async Task<IEnumerable<DailyWorkLogDTO>> GetDailyLogsAsync(int employeeId)
        {
            var sql = @"
                SELECT 
                    WorkDate AS Date,
                    SUM(Hours) AS TotalHours,
                    COUNT(DISTINCT ProjectId) AS ProjectsCount
                    FROM WorkLogs
                    WHERE EmployeeId = @EmployeeId
                    AND IsDeleted = 0
                    GROUP BY WorkDate
                    ORDER BY WorkDate DESC";

            using var conn = _db.CreateConnection();
            return await conn.QueryAsync<DailyWorkLogDTO>(sql, new { EmployeeId = employeeId });
        }

        // =========================
        // Get Logs for a Day
        // =========================
        public async Task<IEnumerable<WorkLog>> GetDailyWorkLogForEmployee(int employeeId, DateTime date)
        {
            var sql = @"
                SELECT Id, ProjectId, EmployeeId, Hours, WorkDate, Notes, Status
                FROM WorkLogs
                WHERE EmployeeId = @EmployeeId
                AND WorkDate >= @StartDate
                AND WorkDate < @EndDate
                AND IsDeleted = 0";

            using var conn = _db.CreateConnection();
            return await conn.QueryAsync<WorkLog>(sql, new
            {
                EmployeeId = employeeId,
                StartDate = date.Date,
                EndDate = date.Date.AddDays(1)
            });
        }

        // =========================
        // Get By Id
        // =========================
        public async Task<WorkLog?> GetByIdAsync(int id)
        {
            var sql = @"
                SELECT * FROM WorkLogs
                WHERE Id = @Id
                AND IsDeleted = 0";

            using var conn = _db.CreateConnection();
            return await conn.QueryFirstOrDefaultAsync<WorkLog>(sql, new { Id = id });
        }

        // =========================
        // Replace Full Day (Bulk Mode)
        // =========================
        public async Task ReplaceDayAsync(int employeeId, DateTime date, IEnumerable<WorkLog> logs)
        {
            var deleteSql = @"
                UPDATE WorkLogs
                SET IsDeleted = 1
                WHERE EmployeeId = @EmployeeId
                AND WorkDate >= @StartDate
                AND WorkDate < @EndDate";

            var insertSql = @"
                INSERT INTO WorkLogs
                (ProjectId, EmployeeId, Hours, WorkDate, Notes, Status)
                VALUES (@ProjectId, @EmployeeId, @Hours, @WorkDate, @Notes, @Status)";

            using var conn = _db.CreateConnection();
            await conn.ExecuteAsync(insertSql, logs);
        }

        // =========================
        // Create Single Log
        // =========================
        public async Task<int> CreateAsync(WorkLog log)
        {
            var sql = @"
                INSERT INTO WorkLogs
                (ProjectId, EmployeeId, Hours, WorkDate, Notes, Status)
                VALUES (@ProjectId, @EmployeeId, @Hours, @WorkDate, @Notes, @Status);

                SELECT CAST(SCOPE_IDENTITY() AS INT);";

            using var conn = _db.CreateConnection();
            return await conn.ExecuteScalarAsync<int>(sql, log);
        }

        // =========================
        // Update Single Log
        // =========================
        public async Task<int> UpdateAsync(WorkLog log)
        {
            var sql = @"
                UPDATE WorkLogs
                SET Hours = @Hours,
                    Notes = @Notes,
                    Status = @Status,
                    UpdatedAt = GETDATE()
                WHERE Id = @Id
                AND IsDeleted = 0";

            using var conn = _db.CreateConnection();
            var rows = await conn.ExecuteAsync(sql, log);
            return rows;
        }

        public async Task<int> SoftDeleteLogAsync(int logId)
        {
            var sql = @"
                UPDATE WorkLogs
                SET IsDeleted = 1
                WHERE Id = @Id";

            using var conn = _db.CreateConnection();
            var rows = await conn.ExecuteAsync(sql, new { Id = logId });
            return rows;
        }

        public async Task<int> DeleteProjectLogsAsync(int employeeId, int projectId)
        {
            var sql = @"
                UPDATE WorkLogs
                SET IsDeleted = 1
                WHERE EmployeeId = @EmployeeId
                AND ProjectId = @ProjectId
                AND IsDeleted = 0";

            using var conn = _db.CreateConnection();
            var rows = await conn.ExecuteAsync(sql, new
            {
                EmployeeId = employeeId,
                ProjectId = projectId
            });
            return rows;
        }

        public async Task<bool> ExistsEmployeeProjectLogsAsync(int employeeId, int projectId)
        {
            var sql = @"
                SELECT 1
                FROM WorkLogs
                WHERE EmployeeId = @EmployeeId
                AND ProjectId = @ProjectId
                AND IsDeleted = 0";

            using var conn = _db.CreateConnection();

            var result = await conn.QueryFirstOrDefaultAsync<int?>(sql, new
            {
                EmployeeId = employeeId,
                ProjectId = projectId
            });

            return result.HasValue;
        }

        //===================================================================

        // Manager
        //=======================
        // Projects Summary
        //=======================
        public async Task<IEnumerable<ProjectSummaryDTO>> GetProjectsSummaryAsync()
        {
            var sql = @"
                SELECT 
                    p.Id AS ProjectId,
                    p.Name AS ProjectName,
                    SUM(w.Hours) AS TotalHours
                FROM WorkLogs w
                JOIN Projects p ON p.Id = w.ProjectId
                WHERE w.IsDeleted = 0
                GROUP BY p.Id, p.Name";

            using var conn = _db.CreateConnection();
            return await conn.QueryAsync<ProjectSummaryDTO>(sql);
        }

        // =========================
        //  Employees per Project
        // =========================
        public async Task<IEnumerable<EmployeeContributionDTO>> GetProjectEmployeesAsync(int projectId)
        {
            var sql = @"
                SELECT 
                    e.Id AS EmployeeId,
                    (e.FirstName + ' ' + e.Lastname) AS EmployeeName,
                    SUM(w.Hours) AS TotalHours
                FROM WorkLogs w
                JOIN Employees e ON e.Id = w.EmployeeId
                WHERE w.ProjectId = @ProjectId
                AND w.IsDeleted = 0
                GROUP BY e.Id, e.FirstName, e.Lastname";

            using var conn = _db.CreateConnection();
            return await conn.QueryAsync<EmployeeContributionDTO>(sql, new { ProjectId = projectId });
        }

        // =========================
        //  Employee Daily Report
        // =========================
        public async Task<IEnumerable<EmployeeDailyReportDTO>> GetEmployeeProjectReportAsync(int projectId, int employeeId)
        {
            var sql = @"
                SELECT 
                    WorkDate AS Date,
                    SUM(Hours) AS Hours
                FROM WorkLogs
                WHERE ProjectId = @ProjectId
                AND EmployeeId = @EmployeeId
                AND IsDeleted = 0
                GROUP BY WorkDate
                ORDER BY WorkDate";

            using var conn = _db.CreateConnection();
            return await conn.QueryAsync<EmployeeDailyReportDTO>(sql, new
            {
                ProjectId = projectId,
                EmployeeId = employeeId
            });
        }
    }
}
