namespace EmployeeService.Domain.Models
{
    public class Employee : BaseEntity
    {
        private Employee() { }
        public string FirstName { get; private set; }
        public string Lastname { get; private set; }
        public string NationalId { get; private set; }
        public string Email { get; private set; }
        public string PhoneNumber { get; private set; }
        public DateTime DateOfBirth { get; private set; }
        public string Address { get; private set; }
        public decimal Salary { get; private set; }
        public DateTime HireDate { get; private set; }
        public EmployeeStatus? Status { get; private set; }
        public int PositionId { get; private set; }
        public int UserId { get; private set; }

        public Position Position { get; private set; }
        public User User { get; private set; }

        public Employee(
            string firstName,
            string lastname,
            string nationalId,
            string email,
            string phoneNumber,
            DateTime dateOfBirth,
            string address,
            decimal salary,
            int positionId,
            int userId,
            EmployeeStatus? status)
        {
            FirstName = firstName;
            Lastname = lastname;
            NationalId = nationalId;
            Email = email;
            PhoneNumber = phoneNumber;
            DateOfBirth = dateOfBirth;
            Address = address;
            Salary = salary;
            PositionId = positionId;
            UserId = userId;

            HireDate = DateTime.UtcNow;
            Status = status == 0 ? EmployeeStatus.Active :status;
            CreatedAt = DateTime.UtcNow;
        }

        public void Update(
            string? firstName,
            string? lastname,
            string? nationalId,
            string? email,
            string? phoneNumber,
            DateTime? dateOfBirth,
            string? address,
            decimal? salary,
            DateTime? hireDate,
            EmployeeStatus? status,
            int? positionId)
        {
            FirstName = firstName ?? FirstName;
            Lastname = lastname ?? Lastname;
            NationalId = nationalId ?? NationalId;
            Email = email ?? Email;
            PhoneNumber = phoneNumber ?? PhoneNumber;
            DateOfBirth = dateOfBirth ?? DateOfBirth;
            Address = address ?? Address;
            Salary = salary ?? Salary;
            HireDate = hireDate ?? HireDate;
            Status = status ?? Status;
            PositionId = positionId ?? PositionId;
        }
    }
}