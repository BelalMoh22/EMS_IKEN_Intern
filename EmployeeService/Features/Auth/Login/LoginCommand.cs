namespace EmployeeService.Features.Auth.Login
{
    public record LoginCommand(string UserName , string Password): IRequest<string>;
}
