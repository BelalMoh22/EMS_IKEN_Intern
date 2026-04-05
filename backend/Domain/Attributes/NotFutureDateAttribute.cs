namespace backend.Domain.Attributes
{
    public class NotFutureDateAttribute : ValidationAttribute
    {
        public NotFutureDateAttribute()
        {
            ErrorMessage = "Date cannot be in the future.";
        }

        protected override ValidationResult? IsValid(object value, ValidationContext validationContext)
        {
            if (value == null)
                return ValidationResult.Success;

            if (value is DateTime dateValue)
            {
                if (dateValue > (DateTime.UtcNow))
                    return new ValidationResult(ErrorMessage);

                return ValidationResult.Success;
            }
            return new ValidationResult("Invalid date format.");
        }
    }
}
