namespace backend.Domain.Models
{
    public class Position : BaseEntity
    {
        private Position() { }
        public string PositionName { get; private set; }
        public decimal MinSalary { get; private set; }
        public decimal MaxSalary { get; private set; }
        public int DepartmentId { get; private set; }
        public string? DepartmentName { get; set; }
        public bool IsManager { get; private set; }
        public int TargetEmployeeCount { get; private set; }
        public int CurrentEmployeeCount { get; private set; }
        public bool IsFull => CurrentEmployeeCount >= TargetEmployeeCount;

        public Position(string positionName, decimal minSalary, decimal maxSalary, int departmentId, int targetEmployeeCount, bool isManager = false)
        {
            PositionName = positionName;
            MinSalary = minSalary;
            MaxSalary = maxSalary;
            DepartmentId = departmentId;
            TargetEmployeeCount = targetEmployeeCount;
            IsManager = isManager;
            CurrentEmployeeCount = 0;
        }

        public void Update(string? positionName, decimal? minSalary, decimal? maxSalary, int? departmentId, int? targetEmployeeCount, bool? isManager)
        {
            PositionName = positionName ?? PositionName;
            MinSalary = minSalary ?? MinSalary;
            MaxSalary = maxSalary ?? MaxSalary;
            DepartmentId = departmentId ?? DepartmentId;
            TargetEmployeeCount = targetEmployeeCount ?? TargetEmployeeCount;
            IsManager = isManager ?? IsManager;
        }
    }
}
