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

            }).WithName("CreateEmployee").WithTags("Employees")
            .DocumentJsonRequest<CreateEmployeeDTO>(new
            {
                firstName = "Yussif",
                lastName = "Khaled",
                nationalId = "12345678901234",
                email = "yussif@example.com",
                phoneNumber = "01000000000",
                dateOfBirth = "2000-01-01",
                address = "Cairo, Egypt",
                salary = 8000,
                hireDate = "2026-03-24",
                status = "Active",
                positionId = 1,
                username = "yussif.khaled",
                password = "Admin12$",
                role = "Employee"
            })
            .WithSummary("Create employee")
            .WithDescription("Creates a new employee and its linked user account (if applicable to your flow).")
            .Produces<ApiResponse<int>>(StatusCodes.Status201Created, contentType: "application/json")
            .Produces<ApiResponse<string>>(StatusCodes.Status400BadRequest, contentType: "application/json")
            .Produces<ApiResponse<string>>(StatusCodes.Status500InternalServerError, contentType: "application/json")
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
        }
    }
}

