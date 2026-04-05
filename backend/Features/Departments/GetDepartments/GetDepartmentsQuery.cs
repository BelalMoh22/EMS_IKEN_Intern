namespace backend.Features.Departments.GetDepartments
{
    public record GetDepartmentsQuery() : IRequest<IEnumerable<Department>>;
}
