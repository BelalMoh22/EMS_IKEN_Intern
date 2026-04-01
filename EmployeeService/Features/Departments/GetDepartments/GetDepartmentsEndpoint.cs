namespace EmployeeService.Features.Departments.GetDepartments
{
    public static class GetDepartmentsEndpoint
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

                var command = new GetDepartmentsQuery(userId, roleClaim ?? "");
                var result = await mediator.Send(command);
                return Results.Ok(ApiResponse<IEnumerable<Department>>.SuccessResponse(result, "Departments retrieved successfully"));
            }).WithName("GetDepartments").WithTags("Departments").RequireAuthorization();

            return app;
        }
    }
}
