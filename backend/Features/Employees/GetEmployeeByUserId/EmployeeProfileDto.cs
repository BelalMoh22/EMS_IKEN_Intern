namespace backend.Features.Employees.GetEmployeeByUserId
{
    public class EmployeeProfileDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string Lastname { get; set; }
        public string NationalId { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Address { get; set; }
        public decimal Salary { get; set; }
        public DateTime HireDate { get; set; }
        public int Status { get; set; }
        
        public string PositionName { get; set; }
        public string DepartmentName { get; set; }
    }
}
