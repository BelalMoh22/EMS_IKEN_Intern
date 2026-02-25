namespace EmployeeService.Features.Auth.Login
{
    public class LoginHandler : IRequestHandler<LoginCommand, string>
    {
        private readonly UserRepository _userRepository;
        private readonly IJwtTokenGenerator _jwt;

        public LoginHandler(UserRepository userRepository,IJwtTokenGenerator jwt)
        {
            _userRepository = userRepository;
            _jwt = jwt;
        }

        public async Task<string> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByUsernameAsync(request.UserName);

            if (user is null)
                throw new UnauthorizedAccessException("Invalid credentials.");

            var isValid = BCrypt.Net.BCrypt.Verify(request.Password,user.PasswordHash);

            if (!isValid)
                throw new UnauthorizedAccessException("Invalid credentials.");

            return _jwt.GenerateToken(user);
        }
    }
}