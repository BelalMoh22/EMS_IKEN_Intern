namespace EmployeeService.Features.Positions.GetPositions
{
    using EmployeeService.Domain.Models;
    public record GetPositionsQuery(int UserId, string UserRole) : IRequest<IEnumerable<Position>>;
}
