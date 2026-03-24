namespace EmployeeService.Features.Employees.CreateEmployee
{
    public class CreateEmployeeHandler : IRequestHandler<CreateEmployeeCommand, int>
    {
        private readonly IRepository<Employee> _repo;
        private readonly UserRepository _userRepository;
        private readonly IEmployeeBusinessRules _rules;

        public CreateEmployeeHandler(IRepository<Employee> repo, UserRepository userRepository, IEmployeeBusinessRules rules)
        {
            _repo = repo;
            _userRepository = userRepository;
            _rules = rules;
        }

        public async Task<int> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
        {
            var dto = request.dto;

            // Step 1: Validate Employee Rules
            await _rules.ValidateForCreateAsync(dto);

            // Step 2: Validate Username uniqueness
            var userExists = await _userRepository.ExistsAsync("Username = @Username AND IsDeleted = 0", new { dto.Username });
            if (userExists)
            {
                throw new Exceptions.ValidationException(new List<string> { "Username already exists." });
            }

            // Step 3: Create User mapped internally
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            var newUser = new User
            {
                Username = dto.Username,
                PasswordHash = hashedPassword,
                Role = dto.Role,
                MustChangePassword = true
            };

            var userId = await _userRepository.AddAsync(newUser);

            // Step 4: Create mapped Employee mapping UserId
            var employee = new Employee(
                dto.FirstName,
                dto.Lastname,
                dto.NationalId,
                dto.Email,
                dto.PhoneNumber,
                dto.DateOfBirth,
                dto.Address,
                dto.Salary,
                dto.PositionId,
                userId,
                dto.Status
            );

            return await _repo.AddAsync(employee);
        }
    }
}