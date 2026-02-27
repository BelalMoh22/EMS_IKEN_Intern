namespace EmployeeService.Features.Departments.UpdateDepartment
{
    public static class UpdateDepartmentEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapPut("/{id:int}", async ([FromRoute] int id, [FromBody] UpdateDepartmentDto dto, [FromServices] IMediator mediator) =>
            {
                var command = new UpdateDepartmentCommand(id, dto);
                var rows = await mediator.Send(command);
                var response = ApiResponse<int>.SuccessResponse("Department updated successfully");
                return Results.Ok(response);
            }).WithDescription("Updating an existing Department").WithTags("Departments");

            return app;
        }
    }
}
