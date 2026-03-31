using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EmployeeService.Domain.Common;

namespace EmployeeService.Features.Attendance.MonthlySummary
{
    public static class GetMonthlySummaryEndpoint
    {
        public static void MapEndpoint(RouteGroupBuilder group)
        {
            group.MapGet("/monthly", async (int? year, int? month, IMediator mediator) =>
            {
                var results = await mediator.Send(new GetMonthlySummaryQuery(year, month));
                return Results.Ok(ApiResponse<List<EmployeeMonthlyAttendanceDto>>.SuccessResponse(results));
            })
            .WithName("GetMonthlyAttendanceSummary")
            .WithTags("Attendance")
            .RequireAuthorization("FullCRUD");
        }
    }
}
