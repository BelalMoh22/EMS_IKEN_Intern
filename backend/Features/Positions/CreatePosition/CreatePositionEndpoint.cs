namespace backend.Features.Positions.CreatePosition
{
    public static class CreatePositionEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapPost("/", async ([FromBody] CreatePositionDto dto, [FromServices] IMediator mediator) =>
            {
                var command = new CreatePositionCommand(dto);
                var id = await mediator.Send(command);

                var response = ApiResponse<int>.SuccessResponse(id, "Position created successfully");

                return Results.Created($"/position/{id}", response);
            }).WithName("CreatePosition").WithTags("Positions");
        }
    }
}

