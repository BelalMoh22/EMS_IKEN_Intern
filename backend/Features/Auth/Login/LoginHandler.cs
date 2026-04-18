namespace backend.Features.Auth.Login
{
    public class LoginHandler: IRequestHandler<LoginCommand, AuthResponse>
    {
        private readonly UserRepository _userRepository;
        private readonly EmployeeRepository _employeeRepository;
        private readonly IRefreshTokenRepository _refreshRepo;
        private readonly IJwtTokenGenerator _jwt;

        public LoginHandler(UserRepository userRepository, EmployeeRepository employeeRepository, IRefreshTokenRepository refreshRepo, IJwtTokenGenerator jwt)
        {
            _userRepository = userRepository;
            _employeeRepository = employeeRepository;
            _refreshRepo = refreshRepo;
            _jwt = jwt;
        }

        public async Task<AuthResponse> Handle(LoginCommand request,CancellationToken cancellationToken)
        {
            var errors = ValidationHelper.ValidateModel(request.dto);

            if(errors.Any())
                throw new Exceptions.ValidationException(errors);

            var user = await _userRepository.GetByUsernameAsync(request.dto.Username);

            if (user is null || !BCrypt.Net.BCrypt.Verify(request.dto.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Please check your username and password and try again.");
            }

            // Check if user is an employee and if their status is terminated or if they are deleted
            var employee = await _employeeRepository.GetByUserIdAsync(user.Id);
            
            // Note: GetByUserIdAsync already filters for IsDeleted = 0. 
            // If employee is null, and the user's role is not something that can exist without an employee record, block them.
            // Since HR, Manager, and Employee roles all represent people in the company:
            if (employee == null)
            {
                 // If the user exists but has no active employee record, they are effectively deleted/removed from the workforce.
                 throw new UnauthorizedAccessException("Access denied. No active employee record found for this account.");
            }

            if (employee.Status == EmployeeStatus.Terminated)
            {
                throw new UnauthorizedAccessException("Your account has been terminated. Please contact HR.");
            }

            var accessToken = _jwt.GenerateToken(user);
            var refreshToken = _jwt.GenerateRefreshToken();

            await _refreshRepo.AddAsync(new RefreshToken
            {
                UserId = user.Id,
                Token = refreshToken,
                Expires = DateTime.UtcNow.AddDays(30),
                IsRevoked = false
            });

            return new AuthResponse(accessToken, refreshToken, user.Id, user.Username, user.Role.ToString(), user.MustChangePassword);
        }
    }
}