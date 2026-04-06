public class ProjectRepository : IProjectRepository
{
    private readonly IDbConnectionFactory _db;

    public ProjectRepository(IDbConnectionFactory db)
    {
        _db = db;
    }

    // =========================
    // GET BY ID
    // =========================
    public async Task<Project?> GetByIdAsync(int id)
    {
        var sql = @"SELECT * FROM Projects 
                    WHERE Id = @Id AND IsDeleted = 0";

        using var conn = _db.CreateConnection();
        return await conn.QueryFirstOrDefaultAsync<Project>(sql, new { Id = id });
    }

    // =========================
    // GET LIST (FILTERABLE)
    // =========================
    public async Task<IEnumerable<Project>> GetAsync(
        int? departmentId,
        int? month,
        int? year,
        ProjectStatus? status)
    {
        var sql = @"SELECT * FROM Projects
                    WHERE IsDeleted = 0
                    AND (@DepartmentId IS NULL OR DepartmentId = @DepartmentId)
                    AND (@Month IS NULL OR Month = @Month)
                    AND (@Year IS NULL OR Year = @Year)
                    AND (@Status IS NULL OR Status = @Status)
                    ORDER BY Id DESC";

        using var conn = _db.CreateConnection();
        return await conn.QueryAsync<Project>(sql, new
        {
            DepartmentId = departmentId,
            Month = month,
            Year = year,
            Status = status
        });
    }

    // =========================
    // CREATE
    // =========================
    public async Task<int> CreateAsync(Project project)
    {
        var sql = @"INSERT INTO Projects
                    (Name, Description, DepartmentId, Month, Year, Status, CreatedBy)
                    VALUES (@Name, @Description, @DepartmentId, @Month, @Year, @Status, @CreatedBy);

                    SELECT CAST(SCOPE_IDENTITY() as int);";

        using var conn = _db.CreateConnection();
        return await conn.ExecuteScalarAsync<int>(sql, project);
    }

    // =========================
    // UPDATE
    // =========================
    public async Task UpdateAsync(Project project)
    {
        var sql = @"UPDATE Projects
                    SET Name = @Name,
                        Description = @Description,
                        Month = @Month,
                        Year = @Year
                    WHERE Id = @Id AND IsDeleted = 0";

        using var conn = _db.CreateConnection();
        await conn.ExecuteAsync(sql, project);
    }

    // =========================
    // DELETE
    // =========================
    public async Task SoftDeleteAsync(int id)
    {
        var sql = @"UPDATE Projects
                    SET IsDeleted = 1
                    WHERE Id = @Id";

        using var conn = _db.CreateConnection();
        await conn.ExecuteAsync(sql, new { Id = id });
    }

    public async Task DeleteAsync(int id)
    { 
        await SoftDeleteAsync(id);
    }
   
    // =========================
    // CLOSE PROJECT
    // =========================
    public async Task CloseAsync(int id)
    {
        var sql = @"UPDATE Projects
                    SET Status = @ClosedStatus,
                        ClosedAt = GETDATE()
                    WHERE Id = @Id AND IsDeleted = 0";

        using var conn = _db.CreateConnection();
        await conn.ExecuteAsync(sql, new
        {
            Id = id,
            ClosedStatus = ProjectStatus.Closed
        });
    }

    // =========================
    // REOPEN PROJECT
    // =========================
    public async Task ReopenAsync(int id)
    {
        var sql = @"UPDATE Projects
                    SET Status = @ActiveStatus,
                        ClosedAt = NULL
                    WHERE Id = @Id AND IsDeleted = 0";

        using var conn = _db.CreateConnection();
        await conn.ExecuteAsync(sql, new
        {
            Id = id,
            ActiveStatus = ProjectStatus.Active
        });
    }

    // =========================
    // TOTAL HOURS
    // =========================
    public async Task<decimal> GetTotalHoursAsync(int projectId)
    {
        var sql = @"SELECT ISNULL(SUM(Hours), 0)
                    FROM WorkLogs
                    WHERE ProjectId = @ProjectId";

        using var conn = _db.CreateConnection();
        return await conn.ExecuteScalarAsync<decimal>(sql, new { ProjectId = projectId });
    }

    //// =========================
    //// EMPLOYEE CONTRIBUTION
    //// =========================
    //public async Task<IEnumerable<EmployeeContributionDto>> GetEmployeesContributionAsync(int projectId)
    //{
    //    var sql = @"SELECT EmployeeId,
    //                       SUM(Hours) AS TotalHours
    //                FROM WorkLogs
    //                WHERE ProjectId = @ProjectId
    //                GROUP BY EmployeeId";

    //    using var conn = _db.CreateConnection();
    //    return await conn.QueryAsync<EmployeeContributionDto>(sql, new { ProjectId = projectId });
    //}

    //// =========================
    //// DAILY LOGS
    //// =========================
    //public async Task<IEnumerable<DailyLogDto>> GetDailyLogsAsync(int projectId)
    //{
    //    var sql = @"SELECT WorkDate,
    //                       SUM(Hours) AS TotalHours
    //                FROM WorkLogs
    //                WHERE ProjectId = @ProjectId
    //                GROUP BY WorkDate
    //                ORDER BY WorkDate";

    //    using var conn = _db.CreateConnection();
    //    return await conn.QueryAsync<DailyLogDto>(sql, new { ProjectId = projectId });
    //}
}