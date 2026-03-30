namespace EmployeeService.Features.Departments.GetDepartmentById
{
    public class GetDepartmentByIdHandler : IRequestHandler<GetDepartmentByIdQuery, Department?>
    {
        private readonly IRepository<Department> _repo;

        public GetDepartmentByIdHandler(IRepository<Department> repo)
        {
            _repo = repo;
        }

        public async Task<Department?> Handle(GetDepartmentByIdQuery request, CancellationToken cancellationToken)
        {
            if (request.Id <= 0)
                throw new Exceptions.ValidationException(new Dictionary<string, List<string>>
                {
                    { "id", new List<string> { "Id must be a positive integer." } }
                });
            var department = await _repo.GetByIdAsync(request.Id); 
            if (department == null)
                throw new NotFoundException($"Department with Id {request.Id} not found.");

            return department;
        }
    }
}
