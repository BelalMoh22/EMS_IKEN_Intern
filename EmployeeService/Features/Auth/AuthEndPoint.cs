namespace EmployeeService.Features.Auth
{
    public static class AuthEndPoint
    {
        public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder group)
        {
            RegisterEndpoint.MapEndpoint(group);
            LoginEndpoint.MapEndpoint(group);
            return group;
        }
    }
}
