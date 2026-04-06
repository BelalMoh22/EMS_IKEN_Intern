namespace backend.Features.Positions.UpdatePosition
{
    public static class UpdatePositionEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapPut("/{id:int}", async ([FromRoute] int id, [FromBody] UpdatePositionDto dto, [FromServices] IMediator mediator) =>
            {
                var command = new UpdatePositionCommand(id, dto);
                var rows = await mediator.Send(command);

                var response = ApiResponse<int>.SuccessResponse(rows, "Position updated successfully");
                return Results.Ok(response);
            }).WithDescription("Updating an existing Position").WithTags("Positions");
        }
    }
}

