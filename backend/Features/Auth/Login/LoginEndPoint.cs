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
            }).WithTags("Auth");
        }
    }
}
