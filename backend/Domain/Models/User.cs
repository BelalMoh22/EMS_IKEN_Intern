namespace backend.Domain.Models
{
    public class User : BaseEntity
    {
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public Roles Role { get; set; }
        public bool MustChangePassword { get; set; } = true;
    }
}
