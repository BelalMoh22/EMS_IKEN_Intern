namespace backend.Features.Auth.ChangePassword
{
    public record ChangePasswordCommand(int UserId, string CurrentPassword, string NewPassword) : IRequest<bool>;
}
