using backend.Infrastructure.BusinessRules.Projects;

namespace backend.Features.TimeTrack.Projects.ReopenProject
{
    public class ReopenProjectHandler
        : IRequestHandler<ReopenProjectCommand, ProjectActionResult>
    {
        private readonly IProjectRepository _repo;
        private readonly IProjectBusinessRules _rules;

        public ReopenProjectHandler(
            IProjectRepository repo,
            IProjectBusinessRules rules)
        {
            _repo = repo;
            _rules = rules;
        }

        public async Task<ProjectActionResult> Handle(
            ReopenProjectCommand request,
            CancellationToken cancellationToken)
        {
            // 🔴 1. Validate Id
            if (request.Id <= 0)
            {
                throw new Exceptions.ValidationException(
                    new Dictionary<string, List<string>>
                    {
                        { "id", new List<string> { "Id must be a positive integer." } }
                    });
            }

            // 🔴 2. Get Project
            var project = await _repo.GetByIdAsync(request.Id);

            if (project is null)
                throw new NotFoundException($"Project with Id {request.Id} not found.");

            // 🔴 3. Business Rules
            await _rules.ValidateForReopenAsync(project);

            // 🔴 4. Reopen
            await _repo.ReopenAsync(request.Id);

            var message = "Project reopened successfully.";

            return new ProjectActionResult(1, message);
        }
    }
}
