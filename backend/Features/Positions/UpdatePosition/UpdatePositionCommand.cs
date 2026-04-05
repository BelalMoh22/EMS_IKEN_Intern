namespace backend.Features.Positions.UpdatePosition
{
    public record UpdatePositionCommand([FromRoute] int Id, [FromBody] UpdatePositionDto dto) : IRequest<int>;
}
