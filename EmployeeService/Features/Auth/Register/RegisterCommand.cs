namespace EmployeeService.Features.Auth.Register
{
    public record RegisterCommand(string UserName , string Password) :IRequest<int>;
}
