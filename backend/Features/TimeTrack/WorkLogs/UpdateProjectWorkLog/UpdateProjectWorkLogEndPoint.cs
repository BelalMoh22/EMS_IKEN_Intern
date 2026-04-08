namespace backend.Features.TimeTrack.WorkLogs.UpdateProjectWorkLog
{
    public static class UpdateProjectWorkLogEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapPut("/{id:int}", async ([FromServices] IMediator mediator, [FromRoute] int id, [FromBody] UpdateWorkLogDTO dto) =>
            {
                var command = new UpdateProjectWorkLogCommand(id, dto);
                var result = await mediator.Send(command);

                return Results.Ok(ApiResponse<WorkLogResponseItemDTO>.SuccessResponse(result, "Work log updated successfully"));
            }).WithName("UpdateWorkLog").WithTags("WorkLogs").RequireAuthorization();
        }
    }
}
