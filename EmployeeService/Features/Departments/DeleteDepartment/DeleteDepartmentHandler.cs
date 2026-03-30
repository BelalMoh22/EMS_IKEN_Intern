namespace EmployeeService.Features.Departments.DeleteDepartment
{
    public class DeleteDepartmentHandler : IRequestHandler<DeleteDepartmentCommand, int>
    {
        private readonly IRepository<Department> _repo;
        private readonly IDepartmentBusinessRules _rules;

        public DeleteDepartmentHandler(IRepository<Department> repo , IDepartmentBusinessRules rules)
        {
            _repo = repo;
            _rules = rules;
        }

        public async Task<int> Handle(DeleteDepartmentCommand request, CancellationToken cancellationToken)
        {
            if (request.id <= 0)
                throw new Exceptions.ValidationException(new Dictionary<string, List<string>>
                {
                    { "id", new List<string> { "Id must be a positive integer." } }
                });

            await _rules.ValidateForDeleteAsync(request.id);
            var rows = await _repo.DeleteAsync(request.id);

            if (rows == 0)
                throw new NotFoundException($"Department with Id {request.id} not found.");

            return rows;
        }
    }
}
