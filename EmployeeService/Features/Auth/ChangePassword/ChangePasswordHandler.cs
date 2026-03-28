using System.Text.RegularExpressions;

namespace EmployeeService.Features.Auth.ChangePassword
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
            if (request.NewPassword != request.ConfirmPassword)
            {
                throw new Exceptions.ValidationException(
                    new List<string> { "New password and confirm password do not match." });
            }

            if (!IsStrongPassword(request.NewPassword))
            {
                throw new Exceptions.ValidationException(
                    new List<string> { "Password must be at least 8 characters and contain an uppercase letter, a number, and a special character." });
            }

            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
            {
                throw new NotFoundException("User not found.");
            }

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid current password.");
            }

            if (BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PasswordHash))
            {
                throw new Exceptions.ValidationException(
                    new List<string> { "New password must be different from the current password." });
            }

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
    }
}
