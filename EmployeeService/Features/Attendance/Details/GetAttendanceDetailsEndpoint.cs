using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EmployeeService.Domain.Common;

namespace EmployeeService.Features.Attendance.Details
{
    public static class GetAttendanceDetailsEndpoint
    {
        public static void MapEndpoint(RouteGroupBuilder group)
        {
            group.MapGet("/details", async (
                int? employeeId, 
                int? year, 
                int? month, 
                int? day, 
                IMediator mediator) =>
            {
                var query = new GetAttendanceDetailsQuery(employeeId, year, month, day);
                var results = await mediator.Send(query);
                return Results.Ok(ApiResponse<List<AttendanceRecordDto>>.SuccessResponse(results));
            })
            .WithName("GetAttendanceDetails")
            .WithTags("Attendance")
            .RequireAuthorization("FullCRUD");
        }
    }
}
