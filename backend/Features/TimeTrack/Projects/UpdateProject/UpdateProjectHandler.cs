using backend.Infrastructure.BusinessRules.Projects;

namespace backend.Features.TimeTrack.Projects.UpdateProject
{
    public class UpdateProjectHandler: IRequestHandler<UpdateProjectCommand, ProjectActionResult>
    {
        private readonly IProjectRepository _repo;
        private readonly IProjectBusinessRules _rules;

        public UpdateProjectHandler(IProjectRepository repo,IProjectBusinessRules rules)
        {
            _repo = repo;
            _rules = rules;
        }

        public async Task<ProjectActionResult> Handle(UpdateProjectCommand request,CancellationToken cancellationToken)
        {
            var project = await _rules.CheckProjectExistsAsync(request.Id);

            await _rules.ValidateOwnershipAndWriteAccessAsync(project);

            var dto = request.dto;
            await _rules.ValidateForUpdateAsync(request.Id, dto, project);

            project.Update(dto.Name,dto.Description, dto.Status);

            var rows = await _repo.UpdateAsync(project);

            var message = "Project updated successfully.";

            return new ProjectActionResult(rows, message);
        }
    }
}
