namespace backend.Features.Positions.UpdatePosition
{
    public class UpdatePositionDto
    {
        public string? PositionName { get; init; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Min salary must be a positive number.")]
        public decimal? MinSalary { get; init; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Max salary must be a positive number.")]
        public decimal? MaxSalary { get; init; }

        public int? DepartmentId { get; init; }
        
        [Range(0, 1000, ErrorMessage = "Target employee count must be between 0 and 1000.")]
        public int? TargetEmployeeCount { get; init; }

        public bool? IsManager { get; init; }
    }
}