namespace backend.Features.Departments.GetDepartments
{
    public class GetDepartmentsHandler : IRequestHandler<GetDepartmentsQuery, IEnumerable<Department>>
    {
        private readonly IRepository<Department> _repo;

        public GetDepartmentsHandler(IRepository<Department> repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<Department>> Handle(GetDepartmentsQuery request, CancellationToken cancellationToken)
        {
            return await _repo.GetAllAsync();
        }
    }
}
