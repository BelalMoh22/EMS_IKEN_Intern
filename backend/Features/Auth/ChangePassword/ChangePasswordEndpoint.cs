namespace backend.Features.Auth.ChangePassword
{
    public static class ChangePasswordEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapPut("/change-password", async ([FromServices] IMediator mediator,[FromBody] ChangePasswordRequestDto body,HttpContext httpContext) =>
            {
                var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Results.Unauthorized();
                }

                var command = new ChangePasswordCommand(
                    userId,
                    body.CurrentPassword,
                    body.NewPassword
                );

                var result = await mediator.Send(command);

                return result
                    ? Results.Ok(ApiResponse<object>.SuccessResponse(null!, "Password changed successfully."))
                    : Results.BadRequest(ApiResponse<object>.FailureResponse(new Dictionary<string, List<string>>
                    {
                        { "password", new List<string> { "Failed to change password." } }
                    }));

            })
            .RequireAuthorization()
            .WithName("ChangePassword")
            .WithTags("Auth")
            .DocumentJsonRequest<ChangePasswordRequestDto>(new { currentPassword = "OldPass12$", newPassword = "NewPass12$" })
            .DocumentApiResponse<object>(
                "Change password",
                "Changes the current user's password. Requires a valid JWT; userId is taken from the token claims."
            );
        }
    }
}

