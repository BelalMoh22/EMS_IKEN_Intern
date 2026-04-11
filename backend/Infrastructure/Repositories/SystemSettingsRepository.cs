
namespace backend.Infrastructure.Repositories
{
    public class SystemSettingsRepository : ISystemSettingsRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public SystemSettingsRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<int> GetWorkLogGracePeriodAsync()
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT TOP 1 WorkLogGracePeriod FROM SystemSettings";
            return await connection.QueryFirstOrDefaultAsync<int>(sql);
        }

        public async Task UpdateWorkLogGracePeriodAsync(int days)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "UPDATE SystemSettings SET WorkLogGracePeriod = @days, UpdatedAt = GETDATE()";
            await connection.ExecuteAsync(sql, new { days });
        }
    }
}
