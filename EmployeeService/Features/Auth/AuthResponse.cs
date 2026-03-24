namespace EmployeeService.Features.Auth
{
    public record AuthResponse(string AccessToken, string RefreshToken, int Id, string Username, string Role, bool MustChangePassword);
}
