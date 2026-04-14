namespace backend.Domain.Interfaces
{
    public interface IWorkLogRepository
    {
        // =========================
        // Timesheet (Employee)
        // =========================
        Task<IEnumerable<MonthlyWorkLogDTO>> GetMonthlyLogsAsync(int employeeId, int year, int month);

        Task UpsertTimesheetAsync(int employeeId, IEnumerable<WorkLog> logs);

        // =========================
        // Manager
        // =========================
        Task<IEnumerable<ProjectSummaryDTO>> GetProjectsSummaryAsync();

        Task<IEnumerable<EmployeeContributionDTO>> GetProjectEmployeesAsync(int projectId);

        Task<IEnumerable<EmployeeDailyReportDTO>> GetEmployeeProjectReportAsync(int projectId, int employeeId);

        Task<IEnumerable<WorkLogReportDto>> GetWorkLogsReportAsync(DateTime startDate, DateTime endDate, int? managerEmployeeId = null);
    }
}
