namespace backend.Features.Positions.UpdatePosition
{
    public static class UpdatePositionEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapPut("/{id:int}", async ([FromRoute] int id, [FromBody] UpdatePositionDto dto, [FromServices] IMediator mediator) =>
            {
                var command = new UpdatePositionCommand(id, dto);
                var rows = await mediator.Send(command);

                var response = ApiResponse<int>.SuccessResponse(rows, "Position updated successfully");
                return Results.Ok(response);
            }).WithName("UpdatePosition").WithTags("Positions")
            .DocumentJsonRequest<UpdatePositionDto>(new { positionName = "Senior HR Specialist", minSalary = 6500, maxSalary = 11000, departmentId = 1, targetEmployeeCount = 5 })
            .DocumentApiResponse<int>(
                "Update position",
                "Updates an existing position. Only provided fields are updated."
            );
        }
    }
}

