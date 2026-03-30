namespace EmployeeService.Infrastructure.BusinessRules
{
    public abstract class BaseBusinessRules
    {
        protected void AddError(Dictionary<string, List<string>> errors, string field, string message)
        {
            if (!errors.ContainsKey(field)) // If the field doesn't exist in the dictionary, initialize it with an empty list
                errors[field] = new List<string>();

            errors[field].Add(message);
        }

        protected void ThrowIfAny(Dictionary<string, List<string>> errors)
        {
            if (errors.Any())
                throw new Exceptions.ValidationException(errors);
        }
    }
}