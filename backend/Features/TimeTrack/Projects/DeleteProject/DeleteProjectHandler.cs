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
            var project = await _rules.CheckProjectExistsAsync(request.Id);

            // 🔴 1. Authorize Ownership
            await _rules.ValidateOwnershipAndWriteAccessAsync(project);

            // 🔴 2. Business Rules
            await _rules.ValidateForDeleteAsync(project);

            // 🔴 3. Delete (Soft Delete)
            await _repo.SoftDeleteAsync(request.Id);

            var message = "Project deleted successfully.";

            return new ProjectActionResult(1, message);
        }
    }
}
