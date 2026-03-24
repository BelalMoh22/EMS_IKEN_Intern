namespace EmployeeService.Infrastructure.Repositories
{
    public class UserRepository : Repository<User>
    {
        protected override string TableName => "Users";

        public UserRepository(IDbConnectionFactory connectionFactory,ILogger<Repository<User>> logger)
        : base(connectionFactory, logger)
        {
        }

        public override async Task<int> AddAsync(User entity)
        {
            var sql = $@"
            INSERT INTO {TableName}
            (Username, PasswordHash, Role, MustChangePassword)
            VALUES
            (@Username, @PasswordHash, @Role, @MustChangePassword);

            SELECT CAST(SCOPE_IDENTITY() as int);";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.ExecuteScalarAsync<int>(sql, entity);
        }

        public override async Task<int> UpdateAsync(int id, User entity)
        {
            var sql = $@"
            UPDATE {TableName}
            SET Username = @Username,
                PasswordHash = @PasswordHash,
                Role = @Role,
                MustChangePassword = @MustChangePassword
            WHERE Id = @Id";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.ExecuteAsync(sql, new
            {
                Id = id,
                entity.Username,
                entity.PasswordHash,
                entity.Role,
                entity.MustChangePassword
            });
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            var sql = $"SELECT * FROM {TableName} WHERE Username = @Username AND IsDeleted = 0";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryFirstOrDefaultAsync<User>(sql , new { Username = username });
        }
    }
}