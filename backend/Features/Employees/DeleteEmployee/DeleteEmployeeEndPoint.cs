namespace backend.Features.Employees.DeleteEmployee
{
    public static class DeleteEmployeeEndPoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapDelete("/{id:int}", async ([FromRoute] int id, [FromServices] IMediator mediator) =>
            {
                var command = new DeleteEmployeeCommand(id);
                var result = await mediator.Send(command);

                var response = ApiResponse<int>.SuccessResponse(result.RowsAffected, result.Message);
                return Results.Ok(response);
            }).WithName("DeleteEmployee").WithTags("Employees")
            .DocumentApiResponse<int>(
                "Delete employee (soft)",
                "Soft-deletes an employee."
            );
        }
    }
}

