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
            })
            .WithName("Register")
            .WithTags("Auth")
            .DocumentJsonRequest<RegisterDto>(new { username = "new.admin", password = "Admin12$", role = "HR" })
            .DocumentApiResponse<int>(
                "Register user (Admin/HR)",
                "Creates a new user account. Requires authorization (Admin/HR depending on policy configuration)."
            );
        }
    }
}
