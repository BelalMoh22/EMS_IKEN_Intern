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
            // 1. Validate confirmPassword matches newPassword
            if (request.NewPassword != request.ConfirmPassword)
            {
                throw new Exceptions.ValidationException(
                    new List<string> { "New password and confirm password do not match." });
            }

            // 2. Validate password strength (min 8 chars, uppercase, number, special char)
            if (!IsStrongPassword(request.NewPassword))
            {
                throw new Exceptions.ValidationException(
                    new List<string> { "Password must be at least 8 characters and contain an uppercase letter, a number, and a special character." });
            }

            // 3. Fetch user from database using userId from JWT
            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
            {
                throw new Exceptions.NotFoundException("User not found.");
            }

            // 4. Verify current password (generic error to avoid leaking details)
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid current password.");
            }

            // 5. New password must not equal current password
            if (BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PasswordHash))
            {
                throw new Exceptions.ValidationException(
                    new List<string> { "New password must be different from the current password." });
            }

            // 6. Hash new password and update
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.MustChangePassword = false;

            var result = await _userRepository.UpdateAsync(user.Id, user);
            return result > 0;
        }

        /// <summary>
        /// Validates password strength: ≥8 chars, at least 1 uppercase, 1 digit, 1 special character.
        /// </summary>
        private static bool IsStrongPassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
                return false;

            return Regex.IsMatch(password, @"[A-Z]")    // uppercase
                && Regex.IsMatch(password, @"[0-9]")     // digit
                && Regex.IsMatch(password, @"[^a-zA-Z0-9]"); // special char
        }
    }
}
