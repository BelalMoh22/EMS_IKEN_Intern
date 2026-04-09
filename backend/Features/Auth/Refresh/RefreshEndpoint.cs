namespace backend.Features.Auth.Refresh
{
    public static class RefreshEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapPost("/refresh", async (RefreshTokenCommand command, IMediator mediator) =>
            {
                var response = await mediator.Send(command);
                return Results.Ok(ApiResponse<AuthResponse>.SuccessResponse(response, "Token refreshed successfully"));
            })
            .WithName("RefreshToken")
            .WithTags("Auth")
            .DocumentJsonRequest<RefreshTokenCommand>(new { refreshToken = "<your_refresh_token_here>" })
            .DocumentApiResponse<AuthResponse>(
                "Refresh JWT",
                "Rotates tokens using a valid refresh token and returns a new access token + refresh token."
            );
        }
    }
}

