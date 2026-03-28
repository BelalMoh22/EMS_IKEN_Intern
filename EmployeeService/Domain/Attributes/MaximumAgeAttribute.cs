namespace EmployeeService.Domain.Attributes
{
    public class MaximumAgeAttribute : ValidationAttribute
    {
        private readonly int _maximumAge;

        public MaximumAgeAttribute(int maximumAge)
        {
            _maximumAge = maximumAge;
            ErrorMessage = $"Age must not exceed {_maximumAge} years.";
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is null)
                return ValidationResult.Success;

            if (value is not DateTime dateOfBirth)
                return new ValidationResult("Invalid date format.");

            var today = DateTime.UtcNow.Date;

            var age = today.Year - dateOfBirth.Year;

            if (dateOfBirth.Date > today.AddYears(-age))
                age--;

            if (age > _maximumAge)
                return new ValidationResult(ErrorMessage);

            return ValidationResult.Success;
        }
    }
}
