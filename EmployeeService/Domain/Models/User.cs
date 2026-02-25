namespace EmployeeService.Domain.Models
{
    public class User : BaseEntity
    {
        [Required(ErrorMessage ="Username is required.")]
        public string Username { get; set; }
        [Required(ErrorMessage = "Password is required.")]
        public string PasswordHash { get; set; }
        public string? Role { get; set; }
    }
}
