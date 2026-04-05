namespace backend.Features.Positions.GetPositionById
{
    using backend.Domain.Models;
    public record GetPositionByIdQuery(int Id) : IRequest<Position?>;
}
