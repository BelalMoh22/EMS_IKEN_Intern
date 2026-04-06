namespace backend.Features.Departments.DeleteDepartment
{
    public static class DeleteDepartmentEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapDelete("/{id:int}", async ([FromRoute] int id, [FromServices] IMediator mediator) =>
            {
                var command = new DeleteDepartmentCommand(id);
                var result = await mediator.Send(command);
                var response = ApiResponse<int>.SuccessResponse(result, "Department deleted successfully");
                return Results.Ok(response);
            }).WithName("DeleteDepartment").WithTags("Departments");
        }
    }
}

