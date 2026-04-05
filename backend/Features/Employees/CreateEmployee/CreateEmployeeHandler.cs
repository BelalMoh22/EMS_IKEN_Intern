namespace backend.Features.Employees.CreateEmployee
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
            await _rules.ValidateForCreateAsync(dto);

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            var newUser = new User
            {
                Username = dto.Username,
                PasswordHash = hashedPassword,
                Role = dto.Role,
                MustChangePassword = true
            };

            var userId = await _userRepository.AddAsync(newUser);

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