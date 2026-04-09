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
            })
            .WithName("CreateProjectWorkLog")
            .WithTags("WorkLogs")
            .RequireAuthorization()
            .DocumentJsonRequest<CreateWorkLogDTO>(new { projectId = 1, workDate = "2026-03-24", hours = 3.5, status = "InProgress", notes = "Implemented employee list" })
            .DocumentApiResponse<int>(
                "Create work log entry",
                "Creates a single work log entry for a project."
            );
        }
    }
}
