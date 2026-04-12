namespace backend.Features.Positions.GetPositionById
{
    public static class GetPositionByIdEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapGet("/{id:int}", async ([FromServices] IMediator mediator, [FromRoute] int id) =>
            {
                var command = new GetPositionByIdQuery(id);
                var result = await mediator.Send(command);
                return Results.Ok(ApiResponse<Position>.SuccessResponse(result, "Position retrieved successfully"));
            }).WithName("GetPositionById").WithTags("Positions")
            .DocumentApiResponse<Position>(
                "Get position by id",
                "Returns a single position by its id."
            );
        }
    }
}

