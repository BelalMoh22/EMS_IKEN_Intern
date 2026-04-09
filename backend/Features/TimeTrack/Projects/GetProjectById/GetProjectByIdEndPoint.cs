namespace backend.Features.TimeTrack.Projects.GetProjectById
{
    public static class GetProjectByIdEndPoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder group)
        {
            return group.MapGet("/{id:int}", async ([FromRoute] int id, [FromServices] IMediator mediator) =>
            {
                var query = new GetProjectByIdQuery(id);
                var project = await mediator.Send(query);
                
                return Results.Ok(ApiResponse<ProjectListDto>.SuccessResponse(project));
            })
            .WithName("GetProjectById")
            .WithTags("Projects")
            .DocumentApiResponse<ProjectListDto>(
                "Get project by id",
                "Returns a single project by its id."
            );
        }
    }
}
