namespace backend.Domain.Common
{
    public static class ValidationHelper
    {
        public static Dictionary<string, List<string>> ValidateModel(object model)
        {
            var context = new ValidationContext(model); // Provides metadata about the object being validated
            var results = new List<ValidationResult>(); // Represents one validation error Contains error message and the field(s) that caused the error
            var errors = new Dictionary<string, List<string>>();

            Validator.TryValidateObject(model, context, results, true);
            /*
             Parameters:
                model → object to validate
                context → metadata
                results → fills errors here
                true → validate all properties
             */

            foreach (var validationResult in results)
            {
                var field = validationResult.MemberNames.FirstOrDefault() ?? "general";

                field = char.ToLowerInvariant(field[0]) + field.Substring(1);

                if (!errors.ContainsKey(field))
                    errors[field] = new List<string>();

                errors[field].Add(validationResult.ErrorMessage ?? "Invalid value");
            }

            return errors;
        }
    }
}