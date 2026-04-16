namespace backend.Domain.Interfaces
{
    public interface ISystemSettingsRepository
    {
        Task<SystemSettings> GetSystemSettingsAsync();
        Task UpdateSystemSettingsAsync(SystemSettings settings);
    }
}
