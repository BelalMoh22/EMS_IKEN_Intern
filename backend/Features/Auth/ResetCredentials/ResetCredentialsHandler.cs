namespace backend.Features.Auth.ResetCredentials
{
    public class ResetCredentialsHandler : IRequestHandler<ResetCredentialsCommand, bool>
    {
        private readonly UserRepository _userRepository;
        private readonly ILogger<ResetCredentialsHandler> _logger;

        public ResetCredentialsHandler(
            UserRepository userRepository,
            ILogger<ResetCredentialsHandler> logger)
        {
            _userRepository = userRepository;
            _logger = logger;
        }

        public async Task<bool> Handle(ResetCredentialsCommand request, CancellationToken cancellationToken)
        {
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Dto.NewPassword);

            await _userRepository.UpdateCredentialsAsync(request.UserId, request.Dto.Username, hashedPassword);

            // Simple audit logging via ILogger
            _logger.LogInformation("HR reset credentials for UserId {UserId} at {Time}", request.UserId, DateTime.UtcNow);

            return true;
        }
    }
}
