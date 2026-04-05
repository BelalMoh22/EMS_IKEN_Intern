namespace backend.Features.Auth.Refresh
{
    public record RefreshTokenCommand(string RefreshToken): IRequest<AuthResponse>;
}
