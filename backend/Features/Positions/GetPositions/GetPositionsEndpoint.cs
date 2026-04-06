namespace backend.Features.Positions.GetPositions
{
    using backend.Domain.Models;
    public static class GetPositionsEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapGet("/", async ([FromServices] IMediator mediator) =>
            {
                var command = new GetPositionsQuery();
                var result = await mediator.Send(command);
                return Results.Ok(ApiResponse<IEnumerable<Position>>.SuccessResponse(result, "Positions retrieved successfully"));
            }).WithName("GetPositions").WithTags("Positions");
        }
    }
}

