namespace EmployeeService.Features.Auth.ResetCredentials
{
    public class ResetCredentialsDto
    {
        public string Username { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
