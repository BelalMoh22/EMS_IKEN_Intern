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
            var project = await _projectRepository.GetByIdAsync(request.ProjectId);

            if (project == null)
                throw new Exception("Project not found.");

            await _rules.ValidateForCloseAsync(project);

            await _projectRepository.CloseAsync(project.Id);

            return Unit.Value;
        }
    }
}
