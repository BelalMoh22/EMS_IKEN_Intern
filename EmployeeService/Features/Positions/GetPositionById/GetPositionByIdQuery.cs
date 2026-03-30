namespace EmployeeService.Features.Positions.GetPositionById
{
    using EmployeeService.Features.Positions;
    public record GetPositionByIdQuery(int Id) : IRequest<PositionDto?>;
}
