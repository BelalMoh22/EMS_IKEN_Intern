namespace backend.Features.Employees.CreateEmployee
{
    public static class CreateEmployeeEndPoint
    {
        public static RouteHandlerBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            return app.MapPost("/", async ([FromBody]CreateEmployeeDTO dto, [FromServices] IMediator mediator) =>
            {
                var command = new CreateEmployeeCommand(dto);
                var id = await mediator.Send(command);
               
                var response = ApiResponse<int>.SuccessResponse(id, "Employee created successfully");
                return Results.Created($"/employees/{id}", response);

            }).WithName("CreateEmployee").WithTags("Employees");
        }
    }
}

