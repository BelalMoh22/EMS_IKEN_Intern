namespace backend.Features.Auth.Register
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
            var errors = ValidationHelper.ValidateModel(request.dto);

            // Business rules
            if (!Enum.IsDefined(typeof(Roles), request.dto.Role))
                AddError(errors, "role", "Invalid role value.");

            var exists = await _userRepository.ExistsAsync(u => u.Username == request.dto.Username && !u.IsDeleted);
            if (exists)
                AddError(errors, "username", "Username already exists.");

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

        private void AddError(Dictionary<string, List<string>> errors, string field, string message)
        {
            if (!errors.ContainsKey(field))
                errors[field] = new List<string>();

            errors[field].Add(message);
        }
    }
}