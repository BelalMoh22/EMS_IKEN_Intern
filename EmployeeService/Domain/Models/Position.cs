namespace EmployeeService.Domain.Models
{
    public class Position : BaseEntity
    {
        private Position() { }
        public string PositionName { get; private set; }
        public decimal MinSalary { get; private set; }
        public decimal MaxSalary { get; private set; }
        public int DepartmentId { get; private set; }
        public int TargetEmployeeCount { get; private set; }
        public int CurrentEmployeeCount { get; private set; }

        public Position(string positionName, decimal minSalary, decimal maxSalary, int departmentId, int targetEmployeeCount)
        {
            PositionName = positionName;
            MinSalary = minSalary;
            MaxSalary = maxSalary;
            DepartmentId = departmentId;
            TargetEmployeeCount = targetEmployeeCount;
            CurrentEmployeeCount = 0;
        }

        public void Update(string? positionName, decimal? minSalary, decimal? maxSalary, int? departmentId, int? targetEmployeeCount)
        {
            PositionName = positionName ?? PositionName;
            MinSalary = minSalary ?? MinSalary;
            MaxSalary = maxSalary ?? MaxSalary;
            DepartmentId = departmentId ?? DepartmentId;
            TargetEmployeeCount = targetEmployeeCount ?? TargetEmployeeCount;
        }
    }
}
