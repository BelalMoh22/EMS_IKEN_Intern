namespace backend.Domain.Attributes
{
    public class MinimumAgeAttribute : ValidationAttribute
    {
        private readonly int _minimumAge;

        public MinimumAgeAttribute(int minimumAge)
        {
            _minimumAge = minimumAge;
            ErrorMessage = $"Age must be at least {_minimumAge} years old.";
        }

        protected override ValidationResult? IsValid(object value, ValidationContext validationContext)
        {
            if (value == null)
                return ValidationResult.Success;

            if (value is DateTime dateOfBirth)
            {
                var age = DateTime.UtcNow.Year - dateOfBirth.Year;

                if (DateTime.UtcNow < dateOfBirth.AddYears(age))
                    age--;

                if (age < _minimumAge)
                    return new ValidationResult(ErrorMessage);

                return ValidationResult.Success;
            }

            return new ValidationResult("Invalid date format.");
        }
    }
}
