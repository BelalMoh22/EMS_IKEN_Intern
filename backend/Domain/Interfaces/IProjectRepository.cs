namespace backend.Domain.Interfaces
{
    public interface IProjectRepository
    {
        Task<Project?> GetByIdAsync(int id);

        Task<IEnumerable<Project>> GetAsync(int? departmentId,int? month,int? year,ProjectStatus? status);

        Task<int> CreateAsync(Project project);

        Task<int> UpdateAsync(Project project);

        Task SoftDeleteAsync(int id);
        // Analytics
        Task<decimal> GetTotalHoursAsync(int projectId);
    }
}