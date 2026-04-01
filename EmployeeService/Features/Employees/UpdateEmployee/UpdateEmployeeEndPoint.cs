namespace EmployeeService.Features.Employees.UpdateEmployee
{
    public static class UpdateEmployeeEndPoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapPut("/{id:int}", async ([FromRoute] int id, [FromBody] UpdateEmployeeDTO dto, [FromServices] IMediator mediator) =>
            {
                var command = new UpdateEmployeeCommand(id , dto);
                var result = await mediator.Send(command);
                var response = ApiResponse<int>.SuccessResponse(result.RowsAffected, result.Message);
                return Results.Ok(response);
            }).WithDescription("Updating an existing Employee").WithTags("Employees").RequireAuthorization("FullCRUD");

            return app;
        }
    }
}
