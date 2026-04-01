namespace EmployeeService.Features.Positions.GetPositionById
{
    using EmployeeService.Domain.Models;
    public record GetPositionByIdQuery(int Id) : IRequest<Position?>;
}
