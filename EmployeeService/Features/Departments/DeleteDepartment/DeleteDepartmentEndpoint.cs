namespace EmployeeService.Features.Departments.DeleteDepartment
{
    public static class DeleteDepartmentEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapDelete("/{id:int}", async ([FromRoute] int id, [FromServices] IMediator mediator) =>
            {
                var command = new DeleteDepartmentCommand(id);
                var result = await mediator.Send(command);
                var response = ApiResponse<int>.SuccessResponse(result, "Department deleted successfully");
                return Results.Ok(response);
            }).WithName("DeleteDepartment").WithTags("Departments");

            return app;
        }
    }
}
