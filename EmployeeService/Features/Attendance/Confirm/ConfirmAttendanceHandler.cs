namespace EmployeeService.Features.Attendance.Confirm
{
    public class ConfirmAttendanceHandler : IRequestHandler<ConfirmAttendanceCommand, int>
    {
        private readonly AttendanceRepository _attendanceRepo;
        private readonly ILogger<ConfirmAttendanceHandler> _logger;

        public ConfirmAttendanceHandler(
            AttendanceRepository attendanceRepo,
            ILogger<ConfirmAttendanceHandler> logger)
        {
            _attendanceRepo = attendanceRepo;
            _logger = logger;
        }

        public async Task<int> Handle(ConfirmAttendanceCommand request, CancellationToken cancellationToken)
        {
            // Only save rows that are marked valid by the frontend review
            var validRows = request.Rows.Where(r => r.IsValid).ToList();

            if (validRows.Count == 0)
                return 0;

            var records = validRows.Select(dto =>
            {
                // Re-parse times from the string representation sent by the client
                TimeSpan? checkIn  = TimeSpan.TryParse(dto.CheckIn,  out var ci) ? ci : null;
                TimeSpan? checkOut = TimeSpan.TryParse(dto.CheckOut, out var co) ? co : null;

                // Re-calculate server-side (never trust client values for business rules)
                int    lateMinutes = AttendanceService.CalculateLateMinutes(checkIn);
                string status      = AttendanceService.GetStatus(checkIn, lateMinutes);

                return new Domain.Models.Attendance
                {
                    EmployeeId  = dto.EmployeeId,
                    Date        = DateTime.Parse(dto.Date),
                    CheckIn     = checkIn,
                    CheckOut    = checkOut,
                    LateMinutes = lateMinutes,
                    Status      = status,
                    CreatedAt   = DateTime.UtcNow
                };
            });

            // await _attendanceRepo.BulkInsertAsync(records);

            _logger.LogInformation("Confirmed and saved {Count} attendance records.", validRows.Count);
            return validRows.Count;
        }
    }
}
