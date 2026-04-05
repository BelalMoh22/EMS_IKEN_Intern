namespace backend.Features.Positions.GetPositions
{
    public record GetPositionsQuery() : IRequest<IEnumerable<Position>>;
}
