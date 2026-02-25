namespace EmployeeService.Infrastructure.Repositories
{
    public class UserRepository : Repository<User>
    {
        protected override string TableName => "Users";

        public UserRepository(
            IDbConnectionFactory connectionFactory,
            ILogger<Repository<User>> logger)
            : base(connectionFactory, logger)
        {
        }

        public override async Task<int> AddAsync(User entity)
        {
            var sql = $@"
            INSERT INTO {TableName}
            (Username, PasswordHash)
            VALUES
            (@Username, @PasswordHash);

            SELECT CAST(SCOPE_IDENTITY() as int);";

            return await _connection.ExecuteScalarAsync<int>(sql, entity);
        }

        public override async Task<int> UpdateAsync(int id, User entity)
        {
            var sql = $@"
            UPDATE {TableName}
            SET Username = @Username,
                PasswordHash = @PasswordHash,
            WHERE Id = @Id";

            return await _connection.ExecuteAsync(sql, new
            {
                Id = id,
                entity.Username,
                entity.PasswordHash,
            });
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            var sql = $"SELECT * FROM {TableName} WHERE Username = @Username AND IsDeleted = 0";

            return await _connection.QueryFirstOrDefaultAsync<User>(
                sql,
                new { Username = username });
        }
    }
}