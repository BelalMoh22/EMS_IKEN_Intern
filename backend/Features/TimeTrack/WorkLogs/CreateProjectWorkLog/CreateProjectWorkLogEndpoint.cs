namespace backend.Features.TimeTrack.WorkLogs.CreateProjectWorkLog
{
    public static class CreateProjectWorkLogEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapPost("/", async ([FromBody] CreateWorkLogDTO dto, [FromServices] IMediator mediator) =>
            {
                var command = new CreateProjectWorkLogCommand(dto);
                var result = await mediator.Send(command);

                return Results.Ok(
                    ApiResponse<int>.SuccessResponse(result, "Work log created successfully")
                );
            }).WithName("CreateProjectWorkLog").WithTags("WorkLogs").RequireAuthorization();
        }
    }
}
