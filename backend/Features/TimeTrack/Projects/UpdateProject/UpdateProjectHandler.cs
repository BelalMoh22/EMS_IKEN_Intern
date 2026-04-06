using backend.Infrastructure.BusinessRules.Projects;

namespace backend.Features.TimeTrack.Projects.UpdateProject
{
    public class UpdateProjectHandler
    : IRequestHandler<UpdateProjectCommand, ProjectActionResult>
    {
        private readonly IProjectRepository _repo;
        private readonly IProjectBusinessRules _rules;

        public UpdateProjectHandler(
            IProjectRepository repo,
            IProjectBusinessRules rules)
        {
            _repo = repo;
            _rules = rules;
        }

        public async Task<ProjectActionResult> Handle(
            UpdateProjectCommand request,
            CancellationToken cancellationToken)
        {
            // 🔴 1. Validate Id
            if (request.Id <= 0)
            {
                throw new Exceptions.ValidationException(new Dictionary<string, List<string>>
            {
                { "id", new List<string> { "Id must be a positive integer." } }
            });
            }

            // 🔴 2. Get Project
            var project = await _repo.GetByIdAsync(request.Id);

            if (project is null)
                throw new NotFoundException($"Project with Id {request.Id} not found.");

            var dto = request.dto;

            // 🔴 3. Business Rules Validation
            await _rules.ValidateForUpdateAsync(request.Id, dto, project);

            // 🔴 4. Update Entity (Domain Method)
            project.Update(
                dto.Name,
                dto.Description,
                dto.Month,
                dto.Year
            );

            // 🔴 5. Save
            await _repo.UpdateAsync(project);

            var message = "Project updated successfully.";

            return new ProjectActionResult(1, message);
        }
    }
}
