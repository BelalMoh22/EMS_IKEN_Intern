namespace EmployeeService.Features.Auth.Login
{
    public static class LoginEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapPost("/login",async (LoginDto dto, IMediator mediator) =>
            {
                var command = new LoginCommand(dto);
                var response = await mediator.Send(command);
                return Results.Ok(ApiResponse<AuthResponse>.SuccessResponse(response, "Login successful"));
            }).WithTags("Auth");

            return app;
        }
    }
}