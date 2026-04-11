namespace backend.Domain.Interfaces
{
    public interface ISystemSettingsRepository
    {
        Task<int> GetWorkLogGracePeriodAsync();
        Task UpdateWorkLogGracePeriodAsync(int days);
    }
}
