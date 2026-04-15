namespace backend.Infrastructure.Services.CurrentUserService
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public int UserId
        {
            get
            {
                var user = _httpContextAccessor.HttpContext?.User;

                var userId =user?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? user?.FindFirst("sub")?.Value;

                if (string.IsNullOrEmpty(userId))
                    throw new Exception("User is not authenticated.");

                return int.Parse(userId);
            }
        }

        public string? UserRole
        {
            get
            {
                var user = _httpContextAccessor.HttpContext?.User;
                return user?.FindFirst(ClaimTypes.Role)?.Value;
            }
        }
    }
}
