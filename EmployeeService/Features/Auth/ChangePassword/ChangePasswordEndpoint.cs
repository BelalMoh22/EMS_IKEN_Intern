namespace EmployeeService.Features.Auth.ChangePassword
{
    public static class ChangePasswordEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapPut("/change-password", async ([FromServices] IMediator mediator,[FromBody] ChangePasswordRequestDto body,HttpContext httpContext) =>
            {
                var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Results.Unauthorized();
                }

                var command = new ChangePasswordCommand(
                    userId,
                    body.CurrentPassword,
                    body.NewPassword,
                    body.ConfirmPassword
                );

                var result = await mediator.Send(command);

                return result
                    ? Results.Ok(ApiResponse<object>.SuccessResponse(null!, "Password changed successfully."))
                    : Results.BadRequest(ApiResponse<object>.FailureResponse(new[] { "Failed to change password." }));

            }).RequireAuthorization().WithName("ChangePassword").WithTags("Auth");

            return app;
        }
    }
}
