namespace EmployeeService.Features.Auth.ChangePassword
{
    /// <summary>
    /// DTO received from the request body (userId is NOT included — it comes from JWT).
    /// </summary>
    public class ChangePasswordRequestDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    /// <summary>
    /// CQRS command — userId is set from the JWT claim in the endpoint, never from the client.
    /// </summary>
    public record ChangePasswordCommand(int UserId, string CurrentPassword, string NewPassword, string ConfirmPassword) : IRequest<bool>;
}
