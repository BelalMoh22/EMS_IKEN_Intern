
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
            const string sql = "SELECT TOP 1 WorkLogGracePeriod FROM SystemSettings ORDER BY Id";
            return await connection.QueryFirstOrDefaultAsync<int>(sql);
        }

        public async Task<bool> IsGracePeriodDisabledAsync()
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT TOP 1 IsDeleted FROM SystemSettings ORDER BY Id";
            return await connection.QueryFirstOrDefaultAsync<bool>(sql);
        }

        public async Task UpdateWorkLogGracePeriodAsync(int days)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                IF EXISTS (SELECT 1 FROM SystemSettings)
                    UPDATE SystemSettings SET WorkLogGracePeriod = @days, UpdatedAt = GETDATE(), IsDeleted = 0
                ELSE
                    INSERT INTO SystemSettings (WorkLogGracePeriod, CreatedAt, UpdatedAt, IsDeleted)
                    VALUES (@days, GETDATE(), GETDATE(), 0)";
            await connection.ExecuteAsync(sql, new { days });
        }

        public async Task DisableGracePeriodAsync()
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "UPDATE SystemSettings SET IsDeleted = 1, UpdatedAt = GETDATE()";
            await connection.ExecuteAsync(sql);
        }
    }
}
