namespace EmployeeService.Features.Auth.ChangePassword
{
    public class ChangePasswordRequestDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public record ChangePasswordCommand(int UserId, string CurrentPassword, string NewPassword) : IRequest<bool>;
}
