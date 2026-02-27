namespace EmployeeService.Features.Departments.GetDepartmentById
{
    public static class GetDepartmentByIdEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapGet("/{id:int}", async ([FromServices] IMediator mediator, [FromRoute] int id) =>
            {
                var command = new GetDepartmentByIdQuery(id);
                var result = await mediator.Send(command);
                return Results.Ok(result);
            }).WithName("GetDepartmentById").WithTags("Departments");

            return app;
        }
    }
}
