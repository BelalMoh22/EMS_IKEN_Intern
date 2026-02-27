namespace EmployeeService.Features.Auth.Register
{
    public static class RegisterEndpoint
    {
        public static RouteGroupBuilder MapEndpoint(this RouteGroupBuilder app)
        {
            app.MapPost("/register",async (RegisterCommand command, IMediator mediator) =>
                {
                    var userId = await mediator.Send(command);
                    return Results.Ok(new { userId });
                }).WithTags("Auth");

            return app;
        }
    }
}