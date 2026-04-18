namespace backend.Features.TimeTrack.Projects.CloseProject
{
    public class CloseProjectHandler : IRequestHandler<CloseProjectCommand, Unit>
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IProjectBusinessRules _rules;

        public CloseProjectHandler(IProjectRepository projectRepository, IProjectBusinessRules rules)
        {
            _projectRepository = projectRepository;
            _rules = rules;
        }
        public async Task<Unit> Handle(CloseProjectCommand request, CancellationToken cancellationToken)
        {
            var project = await _rules.CheckProjectExistsAsync(request.ProjectId);

            await _rules.ValidateOwnershipAndWriteAccessAsync(project);

            await _rules.ValidateForCompleteAsync(project);

            project.Complete();
            await _projectRepository.UpdateAsync(project);

            return Unit.Value;
        }
    }
}
