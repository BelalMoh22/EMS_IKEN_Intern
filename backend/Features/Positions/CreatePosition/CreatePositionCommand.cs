namespace backend.Features.Positions.CreatePosition
{
    public record CreatePositionCommand(CreatePositionDto dto) : IRequest<int>;
}
