namespace EmployeeService.Features.Departments.GetDepartments
{
    public static class GetDepartmentsEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapGet("/", async ([FromServices] IMediator mediator) =>
            {
                var command = new GetDepartmentsQuery();
                var result = await mediator.Send(command);
                return Results.Ok(ApiResponse<IEnumerable<Department>>.SuccessResponse(result, "Departments retrieved successfully"));
            }).WithName("GetDepartments").WithTags("Departments");

            return app;
        }
    }
}
