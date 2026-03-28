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
            var errors = new List<string>();
            errors.AddRange(ValidationHelper.ValidateModel(request.dto));

            if (!Enum.IsDefined(typeof(Roles), request.dto.Role))
                    errors.Add("Invalid role value.");

            var exists = await _userRepository.ExistsAsync(u => u.Username == request.dto.Username && u.IsDeleted == false);
            if (exists)
                errors.Add("Username already exists.");

            if (errors.Any())
                throw new Exceptions.ValidationException(errors);

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.dto.Password);

            var user = new User
            {
                Username = request.dto.Username,
                PasswordHash = hashedPassword,
                Role = request.dto.Role
            };

            return await _userRepository.AddAsync(user);
        }
    }
}