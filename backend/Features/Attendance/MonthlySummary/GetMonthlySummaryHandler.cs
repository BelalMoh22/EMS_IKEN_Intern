namespace backend.Features.Attendance.MonthlySummary
{
    public class GetMonthlySummaryHandler : IRequestHandler<GetMonthlySummaryQuery, List<EmployeeMonthlyAttendanceDto>>
    {
        private readonly AttendanceRepository _attendanceRepo;
        private readonly IRepository<Employee> _employeeRepo;
        private readonly ILogger<GetMonthlySummaryHandler> _logger;

        public GetMonthlySummaryHandler(AttendanceRepository attendanceRepo, IRepository<Employee> employeeRepo, ILogger<GetMonthlySummaryHandler> logger)
        {
            _attendanceRepo = attendanceRepo;
            _employeeRepo = employeeRepo;
            _logger = logger;
        }

        public async Task<List<EmployeeMonthlyAttendanceDto>> Handle(GetMonthlySummaryQuery request, CancellationToken cancellationToken)
        {
            var year = request.Year ?? DateTime.UtcNow.Year;
            var month = request.Month ?? DateTime.UtcNow.Month;

            _logger.LogInformation("Attempting to fetch monthly attendance for Year: {Year}, Month: {Month}", year, month);

            var dbRecords = await _attendanceRepo.GetFilteredAttendanceAsync(null, year, month, null);
            var records = dbRecords.ToList();

            _logger.LogInformation("Found {Count} records in database for the filtered period.", records.Count);

            var employees = (await _employeeRepo.GetAllAsync()).ToDictionary(e => e.Id);

            var summary = records
                .GroupBy(r => r.EmployeeId)
                .Select(g =>
                {
                    var emp = employees.GetValueOrDefault(g.Key);
                    var totalLate = g.Sum(r => r.LateMinutes);
                    var totalEarly = g.Sum(r => r.EarlyLeaveMinutes);
                    var totalWorkingMins = g.Sum(r => r.WorkingMinutes);

                    var totalExcuseHours = (totalLate + totalEarly) / 60.0;
                    var allowedExcuse = 4.0;
                    var deductionHours = Math.Max(0, totalExcuseHours - allowedExcuse);

                    return new EmployeeMonthlyAttendanceDto
                    {
                        EmployeeId = g.Key,
                        EmployeeName = emp != null ? $"{emp.FirstName} {emp.Lastname}" : "Unknown",
                        TotalLateMinutes = totalLate,
                        TotalEarlyMinutes = totalEarly,
                        TotalExcuseHours = Math.Round(totalExcuseHours, 2),
                        DeductionHours = Math.Round(deductionHours, 2),
                        Status = deductionHours > 0 ? "Deduction" : "No Deduction",
                        TotalWorkingHours = Math.Round(totalWorkingMins / 60.0, 2)
                    };
                }).ToList();

            return summary;
        }
    }
}
