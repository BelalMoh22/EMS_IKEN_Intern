namespace backend.Features.Auth.Register
{
    public record RegisterCommand(RegisterDto dto) :IRequest<int>;
}
