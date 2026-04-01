namespace EmployeeService.Features.Positions.GetPositions
{
    using EmployeeService.Domain.Models;
    public record GetPositionsQuery() : IRequest<IEnumerable<Position>>;
}
