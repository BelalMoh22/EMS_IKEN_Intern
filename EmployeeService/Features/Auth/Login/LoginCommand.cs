namespace EmployeeService.Features.Auth.Login
{
    public record LoginCommand(LoginDto dto): IRequest<AuthResponse>;
}
