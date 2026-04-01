namespace EmployeeService.Features.Auth.ResetCredentials
{
    public static class ResetCredentialsEndpoint
    {
        public static void MapEndpoint(RouteGroupBuilder app)
        {
            app.MapPost("/reset-credentials/{userId}", async (int userId, ResetCredentialsDto dto, IMediator mediator) =>
            {
                var command = new ResetCredentialsCommand(userId, dto);
                var result = await mediator.Send(command);
                return result 
                    ? Results.Ok(ApiResponse<object>.SuccessResponse(null!, "Credentials reset successfully")) 
                    : Results.BadRequest(ApiResponse<object>.FailureResponse(new Dictionary<string, List<string>>
                    {
                        { "credentials", new List<string> { "Failed to reset credentials" } }
                    }));
            })
            .RequireAuthorization("FullCRUD")
            .WithTags("Auth");
        }
    }
}
