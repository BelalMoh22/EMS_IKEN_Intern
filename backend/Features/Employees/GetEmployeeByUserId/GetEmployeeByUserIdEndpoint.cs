namespace backend.Features.Employees.GetEmployeeByUserId
{
    public static class GetEmployeeByUserIdEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapGet("/by-user/{userId:int}", async ([FromServices] IMediator mediator, [FromRoute] int userId) =>
            {
                var command = new GetEmployeeByUserIdQuery(userId);
                var result = await mediator.Send(command);

                return Results.Ok(ApiResponse<EmployeeProfileDto>.SuccessResponse(result, "Employee profile retrieved successfully"));
            }).WithName("GetEmployeeByUserId").WithTags("Employees");

            return app;
        }
    }
}
