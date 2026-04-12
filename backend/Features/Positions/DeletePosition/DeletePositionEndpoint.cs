namespace backend.Features.Positions.DeletePosition
{
    public static class DeletePositionEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapDelete("/{id:int}", async ([FromRoute] int id, [FromServices] IMediator mediator) =>
            {
                var command = new DeletePositionCommand(id);
                var result = await mediator.Send(command);
                var response = ApiResponse<int>.SuccessResponse(result, "Position deleted successfully");
                return Results.Ok(response);
            }).WithName("DeletePosition").WithTags("Positions")
            .DocumentApiResponse<int>(
                "Delete position (soft)",
                "Soft-deletes a position (and may cascade soft-delete related entities depending on business rules)."
            );
        }
    }
}

