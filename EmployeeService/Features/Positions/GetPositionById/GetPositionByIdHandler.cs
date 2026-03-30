namespace EmployeeService.Features.Positions.GetPositionById
{
    using EmployeeService.Features.Positions;
    public class GetPositionByIdHandler : IRequestHandler<GetPositionByIdQuery, PositionDto?>
    {
        private readonly IRepository<Position> _repo;

        public GetPositionByIdHandler(IRepository<Position> repo)
        {
            _repo = repo;
        }

        public async Task<PositionDto?> Handle(GetPositionByIdQuery request, CancellationToken cancellationToken)
        {
            if(request.Id <= 0)
            {
                throw new Exceptions.ValidationException(new Dictionary<string, List<string>>
                {
                    { "id", new List<string> { "Id must be a positive integer." } }
                });
            }

            var position = await _repo.GetByIdAsync(request.Id); 
            if(position == null)
            {
                throw new NotFoundException($"Position with Id {request.Id} not found.");
            }
            return new PositionDto
            {
                Id = position.Id,
                PositionName = position.PositionName,
                MinSalary = position.MinSalary,
                MaxSalary = position.MaxSalary,
                DepartmentId = position.DepartmentId,
                TargetEmployeeCount = position.TargetEmployeeCount,
                CurrentEmployeeCount = position.CurrentEmployeeCount
            };
        }
    }
}
