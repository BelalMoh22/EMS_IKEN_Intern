namespace EmployeeService.Features.Positions.UpdatePosition
{
    public static class UpdatePositionEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapPut("/{id:int}", async ([FromRoute] int id, [FromBody] UpdatePositionDto dto, [FromServices] IMediator mediator) =>
            {
                var command = new UpdatePositionCommand(id, dto);
                var rows = await mediator.Send(command);
                var response = ApiResponse<int>.SuccessResponse("Position updated successfully");
                return Results.Ok(response);
            }).WithDescription("Updating an existing Position").WithTags("Positions");

            return app;
        }
    }
}
