namespace EmployeeService.Features.Positions
{
    public class PositionDto
    {
        public int Id { get; set; }
        public string PositionName { get; set; }
        public decimal MinSalary { get; set; }
        public decimal MaxSalary { get; set; }
        public int DepartmentId { get; set; }
        public int TargetEmployeeCount { get; set; }
        public int CurrentEmployeeCount { get; set; }
        public bool IsFull => CurrentEmployeeCount >= TargetEmployeeCount;
    }
}
