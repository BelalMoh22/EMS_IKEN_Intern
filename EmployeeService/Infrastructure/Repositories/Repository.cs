using System.Linq.Expressions;

namespace EmployeeService.Infrastructure.Repositories
{
    public abstract class Repository<T> : IRepository<T> where T : BaseEntity
    {
        protected readonly IDbConnectionFactory _connectionFactory;
        private readonly ILogger<Repository<T>> _logger;

        protected Repository(IDbConnectionFactory connectionFactory,ILogger<Repository<T>> logger)
        {
            _connectionFactory = connectionFactory;
            _logger = logger;
        }
        protected abstract string TableName { get; }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            var sql = $"SELECT * FROM {TableName} WHERE IsDeleted = 0";

            _logger.LogDebug("Executing SQL: {Sql}", sql);

            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryAsync<T>(sql);
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            var sql = $"SELECT * FROM {TableName} WHERE Id = @Id";

            _logger.LogDebug("Executing SQL: {Sql} with Id {Id}", sql, id);

            using var connection = _connectionFactory.CreateConnection();
            return await connection.QueryFirstOrDefaultAsync<T>(sql, new { Id = id });
        }

        public async Task<int> SoftDeleteAsync(int id)
        {
            var sql = $@"
                UPDATE {TableName}
                SET IsDeleted = 1
                WHERE Id = @Id AND IsDeleted = 0";

            using var connection = _connectionFactory.CreateConnection();
            var affected = await connection.ExecuteAsync(sql, new { Id = id });

            if (affected == 0)
                throw new Exceptions.ValidationException(new Dictionary<string, List<string>>
                {
                    { "row", new List<string> { "The row could not be found or is already deleted." } }
                });

            _logger.LogDebug("Executing SOFT DELETE for Id {Id}", id);
            return affected;
        }
        public async Task<int> DeleteAsync(int id)
        {
            return await SoftDeleteAsync(id);
        }

        private (string, DynamicParameters) BuildWhereClause(Expression<Func<T, bool>> predicate)
        {
            var parameters = new DynamicParameters();
            var count = 0;
            var where = ParseExpression(predicate.Body, parameters, ref count);
            return (where, parameters);
        }

        private string ParseExpression(Expression expr, DynamicParameters parameters, ref int count)
        {
            if (expr is BinaryExpression binary)
            {
                if (binary.NodeType == ExpressionType.AndAlso || binary.NodeType == ExpressionType.And)
                    return $"({ParseExpression(binary.Left, parameters, ref count)} AND {ParseExpression(binary.Right, parameters, ref count)})";
                
                if (binary.NodeType == ExpressionType.OrElse || binary.NodeType == ExpressionType.Or)
                    return $"({ParseExpression(binary.Left, parameters, ref count)} OR {ParseExpression(binary.Right, parameters, ref count)})";

                var propertyName = GetPropertyName(binary.Left);
                var value = Expression.Lambda(binary.Right).Compile().DynamicInvoke();
                
                var operatorSql = binary.NodeType switch
                {
                    ExpressionType.Equal => "=",
                    ExpressionType.NotEqual => "!=",
                    ExpressionType.GreaterThan => ">",
                    ExpressionType.GreaterThanOrEqual => ">=",
                    ExpressionType.LessThan => "<",
                    ExpressionType.LessThanOrEqual => "<=",
                    _ => throw new NotSupportedException($"Operator {binary.NodeType} not supported")
                };

                if (value == null && operatorSql == "=") return $"{propertyName} IS NULL";
                if (value == null && operatorSql == "!=") return $"{propertyName} IS NOT NULL";

                var paramName = $"@p{count++}";
                parameters.Add(paramName, value);
                return $"{propertyName} {operatorSql} {paramName}";
            }
            if (expr is UnaryExpression unary && unary.NodeType == ExpressionType.Not)
            {
                return $"{GetPropertyName(unary.Operand)} = 0";
            }
            if (expr is MemberExpression member && member.Type == typeof(bool))
            {
                return $"{GetPropertyName(member)} = 1";
            }
            
            throw new NotSupportedException($"Expression type {expr.NodeType} not supported.");
        }

        private string GetPropertyName(Expression expr)
        {
            if (expr is MemberExpression member) return member.Member.Name;
            if (expr is UnaryExpression unary && unary.NodeType == ExpressionType.Convert && unary.Operand is MemberExpression mem) return mem.Member.Name;
            throw new NotSupportedException($"Left side of the expression must be a property. Found {expr.NodeType}");
        }

        public async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate)
        {
            var (whereClause, parameters) = BuildWhereClause(predicate);

            var sql = $"SELECT 1 FROM {TableName} WHERE {whereClause}";

            using var connection = _connectionFactory.CreateConnection();

            var result = await connection.QueryFirstOrDefaultAsync<int?>(
                sql,
                parameters
            );

            return result.HasValue;
        }

        public abstract Task<int> AddAsync(T entity);
        public abstract Task<int> UpdateAsync(int id, T entity);
    }
}