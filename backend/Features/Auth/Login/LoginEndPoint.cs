namespace backend.Features.Auth.Login
{
    public static class LoginEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapPost("/login",async (LoginDto dto, IMediator mediator) =>
            {
                var command = new LoginCommand(dto);
                var response = await mediator.Send(command);
                return Results.Ok(ApiResponse<AuthResponse>.SuccessResponse(response, "Login successful"));
            })
            .WithName("Login")
            .WithTags("Auth")
            .DocumentJsonRequest<LoginDto>(new { username = "Admin", password = "Admin12$" })
            .DocumentApiResponse<AuthResponse>(
                "Sign in (JWT)",
                "Authenticates a user by username/password and returns an access token + refresh token."
            );
        }
    }
}
