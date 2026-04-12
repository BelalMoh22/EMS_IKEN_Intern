namespace backend.Features.Employees.GetEmployeeByUserId
{
    public static class GetEmployeeByUserIdEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapGet("/by-user/{userId:int}", async ([FromServices] IMediator mediator, [FromRoute] int userId) =>
            {
                var command = new GetEmployeeByUserIdQuery(userId);
                var result = await mediator.Send(command);

                return Results.Ok(ApiResponse<EmployeeProfileDto>.SuccessResponse(result, "Employee profile retrieved successfully"));
            }).WithName("GetEmployeeByUserId").WithTags("Employees")
            .DocumentApiResponse<EmployeeProfileDto>(
                "Get employee profile by user id",
                "Returns employee profile data for a given user id."
            );
        }
    }
}
