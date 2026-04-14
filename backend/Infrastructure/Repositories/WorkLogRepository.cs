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
                    w.WorkDate AS Date,
                    SUM(w.Hours) AS TotalHours,
                    COUNT(DISTINCT w.ProjectId) AS ProjectsCount,
                    STRING_AGG(p.Name + '|' + CAST(w.Hours AS VARCHAR), ';') AS ProjectDetails
                FROM WorkLogs w
                JOIN Projects p ON p.Id = w.ProjectId
                WHERE w.EmployeeId = @EmployeeId
                AND w.IsDeleted = 0
                GROUP BY w.WorkDate
                ORDER BY w.WorkDate DESC";

            using var conn = _db.CreateConnection();
            return await conn.QueryAsync<DailyWorkLogDTO>(sql, new { EmployeeId = employeeId });
        }

        // =========================
        // Get Logs for a Day
        // =========================
        public async Task<IEnumerable<WorkLog>> GetDailyWorkLogForEmployee(int employeeId, DateTime date)
        {
            var sql = @"
                SELECT w.*, p.Name AS ProjectName
                FROM WorkLogs w
                LEFT JOIN Projects p ON w.ProjectId = p.Id
                WHERE w.EmployeeId = @EmployeeId
                AND w.WorkDate >= @StartDate
                AND w.WorkDate < @EndDate
                AND w.IsDeleted = 0";

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
        public async Task SaveDailyWorkLogsAsync(int employeeId, DateTime date, IEnumerable<WorkLog> logs)
        {
            var deleteSql = @"
                DELETE FROM WorkLogs
                WHERE EmployeeId = @EmployeeId
                AND WorkDate = @WorkDate";

            var insertSql = @"
                INSERT INTO WorkLogs
                (ProjectId, EmployeeId, Hours, WorkDate, Notes, Status)
                VALUES (@ProjectId, @EmployeeId, @Hours, @WorkDate, @Notes, @Status)";

            using var conn = _db.CreateConnection();
            conn.Open();
            using var trans = conn.BeginTransaction();
            try
            {
                await conn.ExecuteAsync(deleteSql, new { EmployeeId = employeeId, WorkDate = date.Date }, trans);
                if (logs.Any())
                {
                    await conn.ExecuteAsync(insertSql, logs, trans);
                }
                trans.Commit();
            }
            catch
            {
                trans.Rollback();
                throw;
            }
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

        public async Task<bool> ExistsLogsForDayAsync(int employeeId, DateTime date)
        {
            var sql = @"
                SELECT 1
                FROM WorkLogs
                WHERE EmployeeId = @EmployeeId
                AND WorkDate >= @StartDate
                AND WorkDate < @EndDate
                AND IsDeleted = 0";

            using var conn = _db.CreateConnection();

            var result = await conn.QueryFirstOrDefaultAsync<int?>(sql, new
            {
                EmployeeId = employeeId,
                StartDate = date.Date,
                EndDate = date.Date.AddDays(1)
            });

            return result.HasValue;
        }

        public async Task<bool> ExistsProjectLogForDayAsync(int employeeId, int projectId, DateTime date)
        {
            var sql = @"
                SELECT 1
                FROM WorkLogs
                WHERE EmployeeId = @EmployeeId
                AND ProjectId = @ProjectId
                AND WorkDate >= @StartDate
                AND WorkDate < @EndDate
                AND IsDeleted = 0";

            using var conn = _db.CreateConnection();

            var result = await conn.QueryFirstOrDefaultAsync<int?>(sql, new
            {
                EmployeeId = employeeId,
                ProjectId = projectId,
                StartDate = date.Date,
                EndDate = date.Date.AddDays(1)
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
                    Status,
                    SUM(Hours) AS Hours
                FROM WorkLogs
                WHERE ProjectId = @ProjectId
                AND EmployeeId = @EmployeeId
                AND IsDeleted = 0
                GROUP BY WorkDate, Status
                ORDER BY WorkDate";

            using var conn = _db.CreateConnection();
            return await conn.QueryAsync<EmployeeDailyReportDTO>(sql, new
            {
                ProjectId = projectId,
                EmployeeId = employeeId
            });
        }

        public async Task<IEnumerable<WorkLogReportDto>> GetWorkLogsReportAsync(DateTime startDate, DateTime endDate, int? managerEmployeeId = null)
        {
            var sql = @"
                SELECT 
                    e.Id AS EmployeeId,
                    (e.FirstName + ' ' + e.Lastname) AS EmployeeName,
                    ISNULL(p.Id, 0) AS ProjectId,
                    ISNULL(p.Name, '') AS ProjectName,
                    ISNULL(SUM(w.Hours), 0) AS TotalHours
                FROM Employees e
                LEFT JOIN WorkLogs w ON w.EmployeeId = e.Id 
                    AND w.IsDeleted = 0 
                    AND w.WorkDate >= @StartDate 
                    AND w.WorkDate <= @EndDate
                LEFT JOIN Projects p ON p.Id = w.ProjectId
                LEFT JOIN Positions pos ON e.PositionId = pos.Id
                LEFT JOIN Departments d ON pos.DepartmentId = d.Id
                WHERE e.IsDeleted = 0 ";

            if (managerEmployeeId.HasValue)
            {
                sql += @" AND d.Id IN (
                    SELECT P2.DepartmentId 
                    FROM Employees E2 
                    JOIN Positions P2 ON E2.PositionId = P2.Id 
                    WHERE E2.Id = @ManagerId AND P2.IsManager = 1
                ) ";
            }

            sql += " GROUP BY e.Id, e.FirstName, e.Lastname, p.Id, p.Name";

            using var conn = _db.CreateConnection();
            return await conn.QueryAsync<WorkLogReportDto>(sql, new
            {
                StartDate = startDate.Date,
                EndDate = endDate.Date,
                ManagerId = managerEmployeeId
            });
        }
    }
}
