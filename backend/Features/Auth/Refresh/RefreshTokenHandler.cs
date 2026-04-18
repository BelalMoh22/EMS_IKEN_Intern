namespace backend.Features.Auth.Refresh
{
    public class RefreshTokenHandler: IRequestHandler<RefreshTokenCommand, AuthResponse>
    {
        private readonly UserRepository _userRepository;
        private readonly EmployeeRepository _employeeRepository;
        private readonly IRefreshTokenRepository _refreshRepo;
        private readonly IJwtTokenGenerator _jwt;

        public RefreshTokenHandler(UserRepository userRepository, EmployeeRepository employeeRepository, IRefreshTokenRepository refreshRepo, IJwtTokenGenerator jwt)
        {
            _userRepository = userRepository;
            _employeeRepository = employeeRepository;
            _refreshRepo = refreshRepo;
            _jwt = jwt;
        }

        public async Task<AuthResponse> Handle(RefreshTokenCommand request,CancellationToken cancellationToken)
        {
            var storedToken = await _refreshRepo.GetByTokenAsync(request.RefreshToken);

            if (storedToken is null || storedToken.IsRevoked == true || storedToken.Expires <= DateTime.UtcNow)
            {
                throw new UnauthorizedAccessException("Invalid refresh token.");
            }

            var user = await _userRepository.GetByIdAsync(storedToken.UserId);
            if (user is null)
                throw new UnauthorizedAccessException("Invalid refresh token.");

            // Check if user is an employee and if their status is terminated or if they are deleted
            var employee = await _employeeRepository.GetByUserIdAsync(user.Id);
            
            if (employee == null)
            {
                 throw new UnauthorizedAccessException("Access denied. No active employee record found for this account.");
            }

            if (employee.Status == EmployeeStatus.Terminated)
            {
                throw new UnauthorizedAccessException("Your account has been terminated. Please contact HR.");
            }

            var newAccessToken = _jwt.GenerateToken(user);
            var newRefreshToken = _jwt.GenerateRefreshToken();

            await _refreshRepo.RevokeAsync(storedToken.Id, newRefreshToken);

            await _refreshRepo.AddAsync(new RefreshToken
            {
                UserId = user.Id,
                Token = newRefreshToken,
                Expires = DateTime.UtcNow.AddDays(30),
                IsRevoked = false
            });

            return new AuthResponse(newAccessToken, newRefreshToken, user.Id, user.Username, user.Role.ToString(), user.MustChangePassword);
        }
    }
}