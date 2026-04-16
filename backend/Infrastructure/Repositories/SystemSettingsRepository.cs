namespace backend.Infrastructure.Repositories
{
    public class SystemSettingsRepository : ISystemSettingsRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public SystemSettingsRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<SystemSettings> GetSystemSettingsAsync()
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = "SELECT TOP 1 * FROM SystemSettings ORDER BY Id";
            var settings = await connection.QueryFirstOrDefaultAsync<SystemSettings>(sql);
            
            if (settings == null)
            {
                settings = new SystemSettings(); // Return default settings if none exist
            }
            
            return settings;
        }

        public async Task UpdateSystemSettingsAsync(SystemSettings settings)
        {
            using var connection = _connectionFactory.CreateConnection();
            const string sql = @"
                IF EXISTS (SELECT 1 FROM SystemSettings)
                    UPDATE SystemSettings 
                    SET WorkLogGracePeriodDays = @WorkLogGracePeriodDays, 
                        ReminderTime = @ReminderTime, 
                        IsReminderEnabled = @IsReminderEnabled, 
                        UpdatedAt = GETDATE(), 
                        IsDeleted = @IsDeleted  
                ELSE
                    INSERT INTO SystemSettings (WorkLogGracePeriodDays, ReminderTime, IsReminderEnabled, CreatedAt, UpdatedAt, IsDeleted)
                    VALUES (@WorkLogGracePeriodDays, @ReminderTime, @IsReminderEnabled, GETDATE(), GETDATE(), @IsDeleted)";
            
            await connection.ExecuteAsync(sql, settings);
        }
    }
}
