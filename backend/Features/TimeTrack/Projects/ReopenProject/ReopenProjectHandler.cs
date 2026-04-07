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
            var project = await _rules.CheckProjectExistsAsync(request.Id);

            await _rules.ValidateOwnershipAndWriteAccessAsync(project);

            await _rules.ValidateForReopenAsync(project);

            project.Reopen();
            await _repo.UpdateAsync(project);

            var message = "Project reopened successfully.";

            return new ProjectActionResult(1, message);
        }
    }
}
