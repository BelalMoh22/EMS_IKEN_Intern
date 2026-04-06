using backend.Infrastructure.BusinessRules.Projects;

namespace backend.Features.TimeTrack.Projects.DeleteProject
{
    public class DeleteProjectHandler
        : IRequestHandler<DeleteProjectCommand, ProjectActionResult>
    {
        private readonly IProjectRepository _repo;
        private readonly IProjectBusinessRules _rules;

        public DeleteProjectHandler(
            IProjectRepository repo,
            IProjectBusinessRules rules)
        {
            _repo = repo;
            _rules = rules;
        }

        public async Task<ProjectActionResult> Handle(
            DeleteProjectCommand request,
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
            await _rules.ValidateForDeleteAsync(project);

            // 🔴 4. Delete (Soft Delete)
            await _repo.SoftDeleteAsync(request.Id);

            var message = "Project deleted successfully.";

            return new ProjectActionResult(1, message);
        }
    }
}
