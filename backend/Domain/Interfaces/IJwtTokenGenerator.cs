namespace backend.Domain.Interfaces
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user);

        string GenerateRefreshToken();
    }
}
