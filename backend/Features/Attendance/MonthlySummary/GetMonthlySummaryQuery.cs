namespace backend.Features.Attendance.MonthlySummary
{
    public record GetMonthlySummaryQuery(int? Year, int? Month) : IRequest<List<EmployeeMonthlyAttendanceDto>>;
}
