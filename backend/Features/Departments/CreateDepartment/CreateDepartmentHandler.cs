namespace backend.Features.Departments.CreateDepartment
{
    public class CreateDepartmentHandler : IRequestHandler<CreateDepartmentCommand, int>
    {
        private readonly IRepository<Department> _repo;
        private readonly IDepartmentBusinessRules _rules;

        public CreateDepartmentHandler(IRepository<Department> repo, IDepartmentBusinessRules rules)
        {
            _repo = repo;
            _rules = rules;
        }

        public async Task<int> Handle(CreateDepartmentCommand request, CancellationToken cancellationToken)
        {
            var dto = request.dto;
            await _rules.ValidateForCreateAsync(dto);

            var Department = new Department(dto.DepartmentName,dto.Description);
            return await _repo.AddAsync(Department);
        }
    }
}
