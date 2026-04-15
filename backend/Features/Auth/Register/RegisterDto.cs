namespace backend.Features.Auth.Register
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Username is required.")]
        public string Username { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        public string Password { get; set; }


        [Required(ErrorMessage = "Role is required.")]
        public Roles Role { get; set; }
    }
}
