namespace backend.Features.Positions.GetPositions
{
    public class GetPositionsHandler : IRequestHandler<GetPositionsQuery, IEnumerable<Position>>
    {
        private readonly IRepository<Position> _repo;

        public GetPositionsHandler(IRepository<Position> repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<Position>> Handle(GetPositionsQuery request, CancellationToken cancellationToken)
        {            
            return await _repo.GetAllAsync();
        }
    }
}
