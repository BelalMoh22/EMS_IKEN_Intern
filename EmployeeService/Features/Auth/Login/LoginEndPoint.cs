namespace EmployeeService.Features.Auth.Login
{
    public static class LoginEndpoint
    {
        public static void MapEndpoint(this IEndpointRouteBuilder app)
        {
            app.MapPost("/login",async (LoginCommand command, IMediator mediator) =>
            {
                    var token = await mediator.Send(command);
                    return Results.Ok(new { token });
            }).WithTags("Auth");
        }
    }
}