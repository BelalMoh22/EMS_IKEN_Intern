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
            }).WithTags("Auth");
        }
    }
}

