namespace backend.Domain.Models
{ 
    public class RefreshToken
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string Token { get; set; }

        public DateTime Expires { get; set; }

        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;

        public bool? IsRevoked { get; set; } = false;

        public string? ReplacedByTokenHash { get; set; }
    }
}
