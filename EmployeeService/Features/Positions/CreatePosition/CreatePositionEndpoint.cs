namespace EmployeeService.Features.Positions.CreatePosition
{
    public static class CreatePositionEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapPost("/", async ([FromBody] CreatePositionDto dto, [FromServices] IMediator mediator) =>
            {
                var command = new CreatePositionCommand(dto);
                var id = await mediator.Send(command);

                var response = ApiResponse<int>.SuccessResponse("Position created successfully");

                return Results.Created($"/position/{id}", response);
            }).WithName("CreatePosition").WithTags("Positions");

            return app;
        }
    }
}
