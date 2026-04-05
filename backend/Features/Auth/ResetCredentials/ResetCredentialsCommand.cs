namespace backend.Features.Auth.ResetCredentials
{
    public record ResetCredentialsCommand(int UserId, ResetCredentialsDto Dto) : IRequest<bool>;
}
