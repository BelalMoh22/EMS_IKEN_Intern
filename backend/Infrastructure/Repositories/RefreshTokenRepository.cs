namespace backend.Infrastructure.Repositories
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public RefreshTokenRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<int> AddAsync(RefreshToken token)
        {
            var sql = @"
                INSERT INTO RefreshTokens
                (UserId, Token, Expires, IsRevoked, ReplacedByTokenHash)
                VALUES
                (@UserId, @Token, @Expires, @IsRevoked, @ReplacedByTokenHash);

                SELECT CAST(SCOPE_IDENTITY() as int);
            "; // SCOPE_IDENTITY() Returns the ID of inserted record

            using var connection = _connectionFactory.CreateConnection();
            return await connection.ExecuteScalarAsync<int>(sql, token);
        }

        public async Task<IEnumerable<RefreshToken>> GetByUserIdAsync(int userId)
        {
            var sql = @"
                SELECT * FROM RefreshTokens
                WHERE UserId = @UserId
                ORDER BY CreatedAt DESC
            ";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<RefreshToken>(sql, new { UserId = userId });
        }

        public async Task RevokeAsync(int id, string? replacedByTokenHash = null)
        {
            var sql = @"
                UPDATE RefreshTokens
                SET IsRevoked = 1,
                    ReplacedByTokenHash = @ReplacedByTokenHash
                WHERE Id = @Id
            ";

            using var connection = _connectionFactory.CreateConnection();
            await connection.ExecuteAsync(sql, new
            {
                Id = id,
                ReplacedByTokenHash = replacedByTokenHash
            });
        }

        public async Task DeleteExpiredAsync()
        {
            var sql = @"DELETE FROM RefreshTokens WHERE Expires <= @Now";

            using var connection = _connectionFactory.CreateConnection();
            await connection.ExecuteAsync(sql, new
            {
                Now = DateTime.UtcNow
            }); // Prevent DB from growing infinitely
        } 

        public async Task<RefreshToken?> GetByTokenAsync(string token)
        {
            var sql = @"
                SELECT * FROM RefreshTokens
                WHERE Token = @Token
            ";

            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryFirstOrDefaultAsync<RefreshToken>(sql, new { Token = token });
        }
    }
}