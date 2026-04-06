namespace backend.Features.Auth.Register
{
    public static class RegisterEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapPost("/register", async (RegisterDto dto, IMediator mediator) =>
            {
                var command = new RegisterCommand(dto);
                var userId = await mediator.Send(command);
                return Results.Ok(ApiResponse<int>.SuccessResponse(userId, "User registered successfully"));
            }).WithTags("Auth");
        }
    }
}
