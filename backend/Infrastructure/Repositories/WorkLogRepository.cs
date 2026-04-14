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
        // Timesheet: Monthly Logs
        // =========================
        public async Task<IEnumerable<MonthlyWorkLogDTO>> GetMonthlyLogsAsync(int employeeId, int year, int month)
        {
            var sql = @"
                SELECT 
                    w.ProjectId,
                    p.Name AS ProjectName,
                    CONVERT(VARCHAR(10), w.WorkDate, 120) AS Date,
                    w.Hours
                FROM WorkLogs w
                JOIN Projects p ON p.Id = w.ProjectId
                WHERE w.EmployeeId = @EmployeeId
                AND w.IsDeleted = 0
                AND YEAR(w.WorkDate) = @Year
                AND MONTH(w.WorkDate) = @Month
                ORDER BY w.WorkDate, p.Name";

            using var conn = _db.CreateConnection();
            return await conn.QueryAsync<MonthlyWorkLogDTO>(sql, new
            {
                EmployeeId = employeeId,
                Year = year,
                Month = month
            });
        }

        // =========================
        // Timesheet: Upsert
        // =========================
        public async Task UpsertTimesheetAsync(int employeeId, IEnumerable<WorkLog> logs)
        {
            var upsertSql = @"
                MERGE WorkLogs AS target
                USING (SELECT @ProjectId AS ProjectId, @EmployeeId AS EmployeeId, @WorkDate AS WorkDate) AS source
                ON target.ProjectId = source.ProjectId 
                   AND target.EmployeeId = source.EmployeeId 
                   AND target.WorkDate = source.WorkDate
                   AND target.IsDeleted = 0
                WHEN MATCHED THEN
                    UPDATE SET 
                        Hours = CASE WHEN @Hours > 0 THEN @Hours ELSE target.Hours END,
                        Notes = CASE WHEN @Hours > 0 THEN @Notes ELSE target.Notes END,
                        IsDeleted = CASE WHEN @Hours = 0 THEN 1 ELSE 0 END,
                        UpdatedAt = GETDATE()
                WHEN NOT MATCHED AND @Hours > 0 THEN
                    INSERT (ProjectId, EmployeeId, Hours, WorkDate, Notes)
                    VALUES (@ProjectId, @EmployeeId, @Hours, @WorkDate, @Notes);";

            using var conn = _db.CreateConnection();
            conn.Open();
            using var trans = conn.BeginTransaction();
            try
            {
                foreach (var log in logs)
                {
                    await conn.ExecuteAsync(upsertSql, new
                    {
                        log.ProjectId,
                        log.EmployeeId,
                        log.WorkDate,
                        log.Hours,
                        log.Notes
                    }, trans);
                }
                trans.Commit();
            }
            catch
            {
                trans.Rollback();
                throw;
            }
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
