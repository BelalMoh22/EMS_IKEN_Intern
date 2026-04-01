namespace EmployeeService.Features.Positions.GetPositionById
{
    using EmployeeService.Domain.Models;
    public static class GetPositionByIdEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapGet("/{id:int}", async ([FromServices] IMediator mediator, [FromRoute] int id) =>
            {
                var command = new GetPositionByIdQuery(id);
                var result = await mediator.Send(command);
                return Results.Ok(ApiResponse<Position>.SuccessResponse(result, "Position retrieved successfully"));
            }).WithName("GetPositionById").WithTags("Positions");

            return app;
        }
    }
}
