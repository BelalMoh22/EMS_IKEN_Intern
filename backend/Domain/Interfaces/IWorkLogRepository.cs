namespace backend.Domain.Interfaces
{
    public interface IWorkLogRepository
    {
        // =========================
        // Daily Mode (Bulk)
        // =========================
        Task<IEnumerable<DailyWorkLogDTO>> GetDailyLogsAsync(int employeeId);

        Task<IEnumerable<WorkLog>> GetByEmployeeAndDateAsync(int employeeId, DateTime date);

        Task ReplaceDayAsync(int employeeId, DateTime date, IEnumerable<WorkLog> logs);


        // =========================
        // Incremental Mode
        // =========================
        Task<int> CreateAsync(WorkLog log);

        Task<int> UpdateAsync(WorkLog log);

        Task<WorkLog?> GetByIdAsync(int id);

        Task<int> SoftDeleteLogAsync(int logId);

        // =========================
        // Manager
        // =========================
        Task<IEnumerable<ProjectSummaryDTO>> GetProjectsSummaryAsync();

        Task<IEnumerable<EmployeeContributionDTO>> GetProjectEmployeesAsync(int projectId);

        Task<IEnumerable<EmployeeDailyReportDTO>> GetEmployeeProjectReportAsync(int projectId, int employeeId);
    }
}
