namespace backend.Features.TimeTrack.Projects.UpdateProject
{
    public static class UpdateProjectEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapPut("/{id:int}", async ([FromRoute] int id,[FromBody] UpdateProjectDTO dto,[FromServices] IMediator mediator) =>
            {
                var command = new UpdateProjectCommand(id, dto);

                var result = await mediator.Send(command);

                var response = ApiResponse<int>.SuccessResponse(result.RowsAffected, result.Message);

                return Results.Ok(response);

            }).WithDescription("Updating an existing Project").WithTags("Projects");
        }
    }
}
