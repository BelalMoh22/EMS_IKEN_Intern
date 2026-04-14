using System.Threading.Tasks;

namespace backend.Infrastructure.BusinessRules.Positions
{
    public interface IPositionBusinessRules
    {
        Task ValidateForCreateAsync(CreatePositionDto dto);
        Task ValidateForUpdateAsync(int positionId, UpdatePositionDto dto, Position existingPosition);
        Task ValidateForDeleteAsync(int positionId);
    }
}
