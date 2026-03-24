namespace EmployeeService.Features.Employees.DeleteEmployee
{
    public static class DeleteEmployeeEndPoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapDelete("/{id:int}", async ([FromRoute] int id, [FromServices] IMediator mediator) =>
            {
                var command = new DeleteEmployeeCommand(id);
                var result = await mediator.Send(command);
                var response = ApiResponse<int>.SuccessResponse(result, "Employee deleted successfully");
                return Results.Ok(response);
            }).WithName("DeleteEmployee").WithTags("Employees").RequireAuthorization("FullCRUDEmployee");

            return app;
        }
    }
}
