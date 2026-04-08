namespace backend.Features.TimeTrack.WorkLogs.GetProjectsSummary
{
    public static class GetProjectsSummaryEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapGet("/projects/summary", async ([FromServices] IMediator mediator) =>
            {
                var query = new GetProjectsSummaryQuery();

                var result = await mediator.Send(query);

                return Results.Ok(
                    ApiResponse<IEnumerable<ProjectSummaryDTO>>
                        .SuccessResponse(result, "Projects summary retrieved successfully")
                );
            })
            .WithName("GetProjectsSummary").WithTags("WorkLogs");
        }
    }
}
