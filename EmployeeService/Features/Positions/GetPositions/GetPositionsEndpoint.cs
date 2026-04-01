namespace EmployeeService.Features.Positions.GetPositions
{
    using EmployeeService.Domain.Models;
    public static class GetPositionsEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapGet("/", async (HttpContext httpContext, [FromServices] IMediator mediator) =>
            {
                var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? httpContext.User.FindFirst("sub")?.Value;
                var roleClaim = httpContext.User.FindFirst(ClaimTypes.Role)?.Value;

                if (userIdClaim is null || !int.TryParse(userIdClaim, out int userId))
                    return Results.Unauthorized();

                var command = new GetPositionsQuery(userId, roleClaim ?? "");
                var result = await mediator.Send(command);
                return Results.Ok(ApiResponse<IEnumerable<Position>>.SuccessResponse(result, "Positions retrieved successfully"));
            }).WithName("GetPositions").WithTags("Positions").RequireAuthorization();

            return app;
        }
    }
}
