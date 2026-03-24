namespace EmployeeService.Features.Auth.Refresh
{
    public static class RefreshEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapPost("/refresh", async (RefreshTokenCommand command, IMediator mediator) =>
            {
                var response = await mediator.Send(command);
                return Results.Ok(ApiResponse<AuthResponse>.SuccessResponse(response, "Token refreshed successfully"));
            }).WithTags("Auth");

            return app;
        }
    }
}
