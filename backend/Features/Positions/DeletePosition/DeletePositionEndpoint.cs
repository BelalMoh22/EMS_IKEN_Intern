namespace backend.Features.Positions.DeletePosition
{
    public static class DeletePositionEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapDelete("/{id:int}", async ([FromRoute] int id, [FromServices] IMediator mediator) =>
            {
                var command = new DeletePositionCommand(id);
                var result = await mediator.Send(command);
                var response = ApiResponse<int>.SuccessResponse(result, "Position deleted successfully");
                return Results.Ok(response);
            }).WithName("DeletePosition").WithTags("Positions");

            return app;
        }
    }
}
