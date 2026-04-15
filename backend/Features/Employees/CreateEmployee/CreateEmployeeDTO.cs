namespace backend.Features.Employees.CreateEmployee
{
    public class CreateEmployeeDTO
    {
        [Required(ErrorMessage = "First Name is required.")]
        [MaxLength(50)]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Last Name is required.")]
        [MaxLength(50)]
        public string Lastname { get; set; }

        [Required(ErrorMessage = "National ID is required.")]
        [RegularExpression(@"^\d{14}$", ErrorMessage = "National ID must be exactly 14 numbers.")]
        public string NationalId { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Email must contain @ and be valid.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Phone Number is required.")]
        public string PhoneNumber { get; set; } 

        [Required(ErrorMessage = "Date of Birth is required.")]
        [MinimumAge(18)]
        [MaximumAge(60)]
        [NotFutureDate(ErrorMessage = "Date of Birth cannot be in the future.")]
        [DataType(DataType.Date)]
        public DateTime DateOfBirth { get; set; }



        [Required(ErrorMessage = "Salary is required.")]
        public decimal Salary { get; set; }

        [NotFutureDate(ErrorMessage = "Hire Date cannot be in the future.")]
        [DataType(DataType.Date)]
        public DateTime? HireDate { get; set; }

        public EmployeeStatus? Status { get; set; }

        [Required(ErrorMessage = "PositionId is required.")]
        [ForeignKey("Position")]
        public int PositionId { get; set; }

        // User credentials
        [Required(ErrorMessage = "Username is required.")]
        [MaxLength(50)]
        public string Username { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        public string Password { get; set; }


        [Required(ErrorMessage = "Role is required.")]
        public Roles Role { get; set; }
    }
}
