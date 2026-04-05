namespace backend.Domain.Interfaces
{
    public interface IRefreshTokenRepository
    {
        Task<int> AddAsync(RefreshToken token);
        Task DeleteExpiredAsync();
        Task<RefreshToken?> GetByTokenAsync(string token);
        Task<IEnumerable<RefreshToken>> GetByUserIdAsync(int userId);
        Task RevokeAsync(int id, string? replacedByTokenHash = null);
    }
}