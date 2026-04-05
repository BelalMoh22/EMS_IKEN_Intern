namespace backend.Features.Auth
{
    public static class AuthEndPoint
    {
        public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder group)
        {
            RegisterEndpoint.MapEndpoint(group);
            LoginEndpoint.MapEndpoint(group);
            RefreshEndpoint.MapEndpoint(group);
            ChangePasswordEndpoint.MapEndpoint(group);
            ResetCredentialsEndpoint.MapEndpoint(group);
            return group;
        }
    }
}
