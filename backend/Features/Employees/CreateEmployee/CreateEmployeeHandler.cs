namespace backend.Features.Employees.CreateEmployee
{
    public class CreateEmployeeHandler : IRequestHandler<CreateEmployeeCommand, int>
    {
        private readonly IRepository<Employee> _repo;
        private readonly UserRepository _userRepository;
        private readonly IRepository<Position> _positionRepository;
        private readonly IEmployeeBusinessRules _rules;

        public CreateEmployeeHandler(IRepository<Employee> _repo, UserRepository _userRepository, IRepository<Position> _positionRepository, IEmployeeBusinessRules _rules)
        {
            this._repo = _repo;
            this._userRepository = _userRepository;
            this._positionRepository = _positionRepository;
            this._rules = _rules;
        }
        public async Task<int> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
        {
            var dto = request.dto;
            await _rules.ValidateForCreateAsync(dto);

            var position = await _positionRepository.GetByIdAsync(dto.PositionId);
            
            // If the DTO specifies HR, we keep it. Otherwise, we derive from Position.IsManager
            var role = dto.Role == Roles.HR ? Roles.HR : 
                       (position != null && position.IsManager) ? Roles.Manager : Roles.Employee;

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            var newUser = new User
            {
                Username = dto.Username,
                PasswordHash = hashedPassword,
                Role = role,
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