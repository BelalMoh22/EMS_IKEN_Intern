namespace backend.Features.Employees.GetEmployees
{
    public static class GetEmployeesEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapGet("/", async (HttpContext httpContext, [FromServices] IMediator mediator) =>
            {
                var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? httpContext.User.FindFirst("sub")?.Value;

                var roleClaim = httpContext.User.FindFirst(ClaimTypes.Role)?.Value;

                if (userIdClaim is null || !int.TryParse(userIdClaim, out int userId))
                    return Results.Unauthorized();

                var command = new GetEmployeesQuery(userId, roleClaim ?? "");
                var result = await mediator.Send(command);
                return Results.Ok(ApiResponse<IEnumerable<Employee>>.SuccessResponse(result, "Employees retrieved successfully"));
            }).WithName("GetEmployees").WithTags("Employees");
        }
    }
}

