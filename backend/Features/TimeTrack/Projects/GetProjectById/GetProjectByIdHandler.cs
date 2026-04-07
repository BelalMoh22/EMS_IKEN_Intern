namespace backend.Features.TimeTrack.Projects.GetProjectById
{
    public class GetProjectByIdHandler : IRequestHandler<GetProjectByIdQuery, ProjectListDto>
    {
        private readonly IProjectBusinessRules _rules;

        public GetProjectByIdHandler(IProjectBusinessRules rules)
        {
            _rules = rules;
        }

        public async Task<ProjectListDto> Handle(GetProjectByIdQuery request, CancellationToken cancellationToken)
        {
            // 1. Check exists and 2. Validate ownership & write access (manager-to-department rule)
            var project = await _rules.CheckProjectExistsAsync(request.Id);
            
            await _rules.ValidateOwnershipAndWriteAccessAsync(project);

            return new ProjectListDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                Status = project.Status,
                CreatedAt = project.CreatedAt,
                DepartmentId = project.DepartmentId
            };
        }
    }
}
