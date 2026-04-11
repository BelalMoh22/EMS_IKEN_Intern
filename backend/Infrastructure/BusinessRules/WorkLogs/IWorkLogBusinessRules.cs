namespace backend.Infrastructure.BusinessRules.WorkLogs
{
    public interface IWorkLogBusinessRules
    {
        // =========================
        // Daily (Bulk)
        // =========================
        Task ValidateDailyLogsAsync(int employeeId, CreateUpdateDailyWorkLogsDTO dto);

        // =========================
        // Incremental
        // =========================
        Task ValidateForCreateAsync(int employeeId, CreateWorkLogDTO dto);

        Task ValidateForUpdateAsync(int employeeId, int workLogId, UpdateWorkLogDTO dto, WorkLog existing);

        Task ValidateForDeleteAsync(int employeeId, WorkLog existing);

        Task EnsureNoLogsExistForDayAsync(int employeeId, DateTime date);
        Task EnsureProjectNotLoggedForDayAsync(int employeeId, int projectId, DateTime date);

        // =========================
        // Common
        // =========================
        Task<WorkLog> CheckWorkLogExistsAsync(int workLogId);
        Task CheckEmployeeProjectLogsExistAsync(int employeeId, int projectId);

        void ValidateOwnership(int employeeId, WorkLog existing, Dictionary<string, List<string>> errors);

        Task ValidateProjectAsync(int projectId, Dictionary<string, List<string>> errors);

        Task ValidateDailyHoursLimitAsync(int employeeId, DateTime date, decimal newHours, Dictionary<string, List<string>> errors, int? excludeLogId = null);

        void ValidateStatus(WorkStatus status, Dictionary<string, List<string>> errors);
        Task ValidateGracePeriodAsync(DateTime workDate, Dictionary<string, List<string>> errors);
    }
}
