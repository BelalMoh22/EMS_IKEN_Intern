namespace backend.Features.TimeTrack.WorkLogs.CreateProjectWorkLog
{
    public static class CreateProjectWorkLogEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapPost("/project", async ([FromBody] CreateProjectWorkLogCommand command, [FromServices] IMediator mediator) =>
            {
                var result = await mediator.Send(command);

                return Results.Ok(
                    ApiResponse<int>.SuccessResponse(result, "Work log created successfully")
                );
            }).WithName("CreateProjectWorkLog").WithTags("WorkLogs");
        }
    }
}
