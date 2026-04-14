namespace backend.Features.Positions.CreatePosition
{
    public class CreatePositionDto
    {
        [Required(ErrorMessage = "Position name is required.")]
        public string PositionName { get; set; }

        [Required(ErrorMessage = "Min salary is required.")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Min salary must be a positive number.")]
        public decimal MinSalary { get; set; }

        [Required(ErrorMessage = "Max salary is required.")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Max salary must be a positive number.")]
        public decimal MaxSalary { get; set; }

        [Required(ErrorMessage = "Department ID is required.")]
        public int DepartmentId { get; set; }

        [Range(0, 1000, ErrorMessage = "Target employee count must be between 0 and 1000.")]
        public int TargetEmployeeCount { get; set; }

        public bool IsManager { get; set; } = false;
    }
}