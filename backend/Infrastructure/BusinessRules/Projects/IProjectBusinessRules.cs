namespace backend.Infrastructure.BusinessRules.Projects
{
    public interface IProjectBusinessRules
    {
        Task ValidateFilterAsync(GetProjectsQuery query);

        Task ValidateForCreateAsync(int departmentId, CreateProjectDTO dto);

        Task ValidateForUpdateAsync(int projectId, UpdateProjectDTO dto, Project existing);

        Task ValidateForDeleteAsync(Project project);

        Task ValidateForCompleteAsync(Project project);

        Task ValidateForReopenAsync(Project project);

        Task<Project> CheckProjectExistsAsync(int projectId);

        Task ValidateOwnershipAndWriteAccessAsync(Project existingProject);

    }
}
