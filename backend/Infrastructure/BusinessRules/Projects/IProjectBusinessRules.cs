namespace backend.Infrastructure.BusinessRules.Projects
{
    public interface IProjectBusinessRules
    {
        // Task ValidateForCreateAsync(CreateProjectDTO dto);

        Task ValidateForUpdateAsync(int projectId, UpdateProjectDTO dto, Project existing);

        Task ValidateForDeleteAsync(Project project);

        Task ValidateForCloseAsync(Project project);

        Task ValidateForReopenAsync(Project project);

        Task<Project> CheckProjectExistsAsync(int projectId);

    }
}
