namespace EmployeeService.Features.Auth.Register
{
    public class RegisterHandler : IRequestHandler<RegisterCommand, int>
    {
        private readonly UserRepository _userRepository;

        public RegisterHandler(UserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<int> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            var exists = await _userRepository.ExistsAsync("Username = @Username AND IsDeleted = 0",new { request.UserName });

            if (exists)
                throw new Exception("Username already exists.");

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Username = request.UserName,
                PasswordHash = hashedPassword,  
            };

            return await _userRepository.AddAsync(user);
        }
    }
}