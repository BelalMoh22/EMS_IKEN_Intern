namespace backend.Domain.Interfaces
{
    public interface ISystemSettingsRepository
    {
        Task<int> GetWorkLogGracePeriodAsync();
        Task<bool> IsGracePeriodDisabledAsync();
        Task UpdateWorkLogGracePeriodAsync(int days);
        Task DisableGracePeriodAsync();
    }
}
