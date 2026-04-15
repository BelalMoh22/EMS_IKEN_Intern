namespace backend.Infrastructure.Services.CurrentUserService
{
    public interface ICurrentUserService
    {
        int UserId { get; }
        string? UserRole { get; }
    }
}
