namespace EmployeeService.Features.Attendance
{
    public static class AttendanceService
    {
        private static readonly TimeSpan DefaultWorkStart = new(9, 0, 0);
        private static readonly TimeSpan MaxWorkEnd = new(18, 0, 0);
        private static readonly int WorkDurationHours = 8;
        private static readonly TimeSpan GracePeriod = new(0, 15, 0);

        /// <summary>
        /// Full attendance calculation: LateMinutes, EarlyLeaveMinutes, WorkingMinutes, Status.
        /// workStartHour can be 7, 8, 9, or 10 (configurable). Default = 9.
        /// </summary>
        public static AttendanceCalcResult Calculate(TimeSpan? checkIn, TimeSpan? checkOut, int workStartHour = 9)
        {
            var workStart = new TimeSpan(workStartHour, 0, 0);
            var expectedEnd = workStart.Add(TimeSpan.FromHours(WorkDurationHours));
            if (expectedEnd > MaxWorkEnd) expectedEnd = MaxWorkEnd;

            // Absent
            if (checkIn is null)
            {
                return new AttendanceCalcResult
                {
                    LateMinutes = 0,
                    EarlyLeaveMinutes = 0,
                    WorkingMinutes = 0,
                    Status = "Absent"
                };
            }

            // Normalize times
            var actualCheckIn = checkIn.Value < workStart ? workStart : checkIn.Value;
            var actualCheckOut = checkOut.HasValue
                ? (checkOut.Value > MaxWorkEnd ? MaxWorkEnd : checkOut.Value)
                : actualCheckIn; // no checkout = 0 working

            // Late minutes
            int lateMinutes = 0;
            if (checkIn.Value > workStart + GracePeriod)
                lateMinutes = (int)(checkIn.Value - workStart).TotalMinutes;

            // Working minutes
            int workingMinutes = 0;
            if (actualCheckOut > actualCheckIn)
                workingMinutes = (int)(actualCheckOut - actualCheckIn).TotalMinutes;

            // Early leave minutes
            int earlyLeaveMinutes = 0;
            if (checkOut.HasValue && actualCheckOut < expectedEnd)
                earlyLeaveMinutes = (int)(expectedEnd - actualCheckOut).TotalMinutes;

            // Status
            string status;
            if (lateMinutes > 0)
                status = "Late";
            else if (earlyLeaveMinutes > 0)
                status = "EarlyLeave";
            else
                status = "Present";

            return new AttendanceCalcResult
            {
                LateMinutes = lateMinutes,
                EarlyLeaveMinutes = earlyLeaveMinutes,
                WorkingMinutes = workingMinutes,
                Status = status
            };
        }

        /// <summary>
        /// Backward-compatible: returns late minutes only.
        /// </summary>
        public static int CalculateLateMinutes(TimeSpan? checkIn)
        {
            return Calculate(checkIn, null).LateMinutes;
        }

        /// <summary>
        /// Backward-compatible: derives status from checkIn and lateMinutes.
        /// </summary>
        public static string GetStatus(TimeSpan? checkIn, int lateMinutes)
        {
            if (checkIn is null)
                return "Absent";
            return lateMinutes > 0 ? "Late" : "Present";
        }
    }

    public class AttendanceCalcResult
    {
        public int LateMinutes { get; set; }
        public int EarlyLeaveMinutes { get; set; }
        public int WorkingMinutes { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
