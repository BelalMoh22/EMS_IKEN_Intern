namespace EmployeeService.Features.Positions
{
    public static class PositionEndpoints
    {
        public static RouteGroupBuilder MapPositionEndpoints(this RouteGroupBuilder group)
        {
            GetPositionsEndpoint.MapEndpoint(group);
            GetPositionByIdEndpoint.MapEndpoint(group);
            CreatePositionEndpoint.MapEndpoint(group);
            UpdatePositionEndpoint.MapEndpoint(group);
            DeletePositionEndpoint.MapEndpoint(group);

            return group;
        }
    }
}
