namespace backend.Features.Positions
{
    public static class PositionEndpoints
    {
        public static RouteGroupBuilder MapPositionEndpoints(this RouteGroupBuilder group)
        {
            GetPositionsEndpoint.MapEndpoint(group).RequireAuthorization("ReadResource");
            GetPositionByIdEndpoint.MapEndpoint(group).RequireAuthorization("ReadResource");
            CreatePositionEndpoint.MapEndpoint(group).RequireAuthorization("FullCRUD");
            UpdatePositionEndpoint.MapEndpoint(group).RequireAuthorization("FullCRUD");
            DeletePositionEndpoint.MapEndpoint(group).RequireAuthorization("FullCRUD");

            return group;
        }
    }
}
