namespace backend.Features.Employees.GetEmployeeByUserId
{
    public class GetEmployeeByUserIdHandler : IRequestHandler<GetEmployeeByUserIdQuery, EmployeeProfileDto?>
    {
        private readonly  EmployeeRepository _repo;

        public GetEmployeeByUserIdHandler(EmployeeRepository repo)
        {
            _repo = repo;
        }

        public async Task<EmployeeProfileDto?> Handle(GetEmployeeByUserIdQuery request, CancellationToken cancellationToken)
        {
            if (request.UserId <= 0)
                throw new Exceptions.ValidationException(new Dictionary<string, List<string>>
                {
                    { "id", new List<string> { "Id must be a positive integer." } }
                });

            var profile = await _repo.GetEmployeeProfileByUserIdAsync(request.UserId);
            if (profile == null)
                throw new NotFoundException($"Employee with UserId {request.UserId} not found.");

            return profile;
        }
    }
}
