using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeService.Features.Employees.CreateEmployee
{
    public static class CreateEmployeeEndPoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapPost("/", async ([FromBody]CreateEmployeeDTO dto, [FromServices] IMediator mediator) =>
            {
                var command = new CreateEmployeeCommand(dto);
                var id = await mediator.Send(command);
               
                var response = ApiResponse<int>.SuccessResponse(id, "Employee created successfully");
                return Results.Created($"/employees/{id}", response);
            }).WithName("CreateEmployee").WithTags("Employees").RequireAuthorization("FullCRUDEmployee");

            return app;
        }
    }
}
