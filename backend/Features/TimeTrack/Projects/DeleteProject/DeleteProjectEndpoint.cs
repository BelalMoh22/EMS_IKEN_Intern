namespace backend.Features.TimeTrack.Projects.DeleteProject
{
    public static class DeleteProjectEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapDelete("/{id:int}", async ([FromRoute] int id,[FromServices] IMediator mediator) =>
            {
                var command = new DeleteProjectCommand(id);

                var result = await mediator.Send(command);

                var response = ApiResponse<int>.SuccessResponse(result.RowsAffected,result.Message);

                return Results.Ok(response);

            }).WithName("DeleteProject").WithTags("Projects");
        }
    }
}
