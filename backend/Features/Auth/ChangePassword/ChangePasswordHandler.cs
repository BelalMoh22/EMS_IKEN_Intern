using System.Text.RegularExpressions;
namespace backend.Features.Auth.ChangePassword
{
    public class ChangePasswordHandler : IRequestHandler<ChangePasswordCommand, bool>
    {
        private readonly UserRepository _userRepository;

        public ChangePasswordHandler(UserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<bool> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            var errors = new Dictionary<string, List<string>>();

            // Business rules

            if (!IsStrongPassword(request.NewPassword))
                AddError(errors, "newPassword", "Password must be at least 8 characters and contain an uppercase letter, a number, and a special character.");

            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
                throw new NotFoundException("User not found.");

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                AddError(errors, "currentPassword", "Invalid current password.");

            if (BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PasswordHash))
                AddError(errors, "newPassword", "New password must be different from the current password.");

            if (errors.Any())
                throw new Exceptions.ValidationException(errors);

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.MustChangePassword = false;

            var result = await _userRepository.UpdateAsync(user.Id, user);
            return result > 0;
        }

        private static bool IsStrongPassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
                return false;

            return Regex.IsMatch(password, @"[A-Z]")
                && Regex.IsMatch(password, @"[0-9]")
                && Regex.IsMatch(password, @"[^a-zA-Z0-9]");
        }

        private void AddError(Dictionary<string, List<string>> errors, string field, string message)
        {
            if (!errors.ContainsKey(field))
                errors[field] = new List<string>();

            errors[field].Add(message);
        }
    }
}