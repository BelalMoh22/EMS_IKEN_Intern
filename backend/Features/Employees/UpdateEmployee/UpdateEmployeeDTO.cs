namespace backend.Features.Employees.UpdateEmployee
{
    public class UpdateEmployeeDTO 
    {
        [MaxLength(50)]
        public string? FirstName { get; set; }

        [MaxLength(50)]
        public string? Lastname { get; set; }

        [RegularExpression(@"^\d{14}$", ErrorMessage = "National ID must be exactly 14 numbers.")]
        public string? NationalId { get; set; }

        [EmailAddress(ErrorMessage = "Email must contain @ and be valid.")]
        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }

        [MinimumAge(18)]
        [MaximumAge(60)]
        [NotFutureDate(ErrorMessage = "Date of Birth cannot be in the future.")]
        [DataType(DataType.Date)]
        public DateTime? DateOfBirth { get; set; }

        [MaxLength(200)]
        public string? Address { get; set; }

        public decimal? Salary { get; set; }

        [NotFutureDate(ErrorMessage = "Hire Date cannot be in the future.")]
        [DataType(DataType.Date)]
        public DateTime? HireDate { get; set; }

        public EmployeeStatus? Status { get; set; }

        [ForeignKey("Position")]
        public int? PositionId { get; set; }

    }
}
