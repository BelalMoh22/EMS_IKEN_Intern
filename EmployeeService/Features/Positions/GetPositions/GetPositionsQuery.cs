namespace EmployeeService.Features.Positions.GetPositions
{
    using EmployeeService.Features.Positions;
    public record GetPositionsQuery() : IRequest<IEnumerable<PositionDto>>;
}
