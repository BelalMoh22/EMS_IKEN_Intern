namespace backend.Features.Departments.UpdateDepartment
{
    public static class UpdateDepartmentEndpoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapPut("/{id:int}", async ([FromRoute] int id, [FromBody] UpdateDepartmentDto dto, [FromServices] IMediator mediator) =>
            {
                var command = new UpdateDepartmentCommand(id, dto);
                var rows = await mediator.Send(command);
                var response = ApiResponse<int>.SuccessResponse(rows, "Department updated successfully");
                return Results.Ok(response);
            })
            .WithName("UpdateDepartment")
            .WithTags("Departments")
            .DocumentJsonRequest<UpdateDepartmentDto>(new { departmentName = "HR", description = "Updated description", managerId = 123, isActive = true })
            .DocumentApiResponse<int>(
                "Update department",
                "Updates an existing department. Only provided fields are updated."
            );
        }
    }
}

