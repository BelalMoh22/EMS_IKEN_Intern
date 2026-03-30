namespace EmployeeService.Features.Positions.GetPositions
{
    public static class GetPositionsEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapGet("/", async ([FromServices] IMediator mediator) =>
            {
                var command = new GetPositionsQuery();
                var result = await mediator.Send(command);
                return Results.Ok(ApiResponse<IEnumerable<PositionDto>>.SuccessResponse(result, "Positions retrieved successfully"));
            }).WithName("GetPositions").WithTags("Positions");

            return app;
        }
    }
}
