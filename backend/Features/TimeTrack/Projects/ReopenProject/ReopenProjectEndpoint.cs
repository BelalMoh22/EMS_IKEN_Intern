namespace backend.Features.TimeTrack.Projects.ReopenProject
{
    public static class ReopenProjectEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapPut("/{id:int}/reopen", async (
                [FromRoute] int id,
                [FromServices] IMediator mediator) =>
            {
                var command = new ReopenProjectCommand(id);

                var result = await mediator.Send(command);

                var response = ApiResponse<int>.SuccessResponse(
                    result.RowsAffected,
                    result.Message);

                return Results.Ok(response);

            }).WithName("ReopenProject")
              .WithTags("Projects");
        }
    }
}
