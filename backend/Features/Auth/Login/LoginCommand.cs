namespace backend.Features.Auth.Login
{
    public record LoginCommand(LoginDto dto): IRequest<AuthResponse>;
}
