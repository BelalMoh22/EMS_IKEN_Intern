namespace EmployeeService.Features.Attendance
{
    public class AttendanceCalcResult
    {
        public int LateMinutes { get; set; }
        public int EarlyLeaveMinutes { get; set; }
        public int WorkingMinutes { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public static class AttendanceService
    {
        private static readonly TimeSpan MinWorkStart = new(7, 0, 0);
        private static readonly TimeSpan LateThreshold = new(10, 0, 0);
        private static readonly TimeSpan MaxWorkEnd = new(18, 0, 0);
        private const int RequiredWorkMinutes = 480; // 8 hours

        public static AttendanceCalcResult Calculate(TimeSpan? checkIn, TimeSpan? checkOut)
        {
            // 1. Absent check
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

            // 2. Late calculation (Fixed threshold: 10:00 AM)
            int lateMinutes = 0;
            if (checkIn.Value > LateThreshold)
            {
                lateMinutes = (int)(checkIn.Value - LateThreshold).TotalMinutes;
            }

            // 3. Working minutes calculation
            var actualCheckIn = checkIn.Value < MinWorkStart ? MinWorkStart : checkIn.Value;
            
            // If checkOut > 18:00 -> Cap to 18:00
            // If checkOut is null -> WorkingMinutes = 0
            var actualEnd = checkOut.HasValue && checkOut.Value > MaxWorkEnd ? MaxWorkEnd : checkOut;
            var actualCheckOut = actualEnd ?? actualCheckIn;

            int workingMinutes = 0;
            if (actualCheckOut > actualCheckIn)
            {
                workingMinutes = (int)(actualCheckOut - actualCheckIn).TotalMinutes;
            }

            // 4. Early Leave calculation (Required Work = 8 hours)
            int earlyLeaveMinutes = 0;
            if (workingMinutes < RequiredWorkMinutes)
            {
                earlyLeaveMinutes = RequiredWorkMinutes - workingMinutes;
            }

            // 5. Status Rules (Can be BOTH Late AND EarlyLeave)
            string status;
            var statuses = new List<string>();
            
            if (lateMinutes > 0) statuses.Add("Late");
            if (earlyLeaveMinutes > 0) statuses.Add("EarlyLeave");
            
            if (statuses.Count == 0)
                status = "Present";
            else
                status = string.Join(", ", statuses);

            return new AttendanceCalcResult
            {
                LateMinutes = lateMinutes,
                EarlyLeaveMinutes = earlyLeaveMinutes,
                WorkingMinutes = workingMinutes,
                Status = status
            };
        }

        public static int CalculateLateMinutes(TimeSpan? checkIn)
        {
            return Calculate(checkIn, null).LateMinutes;
        }

        public static string GetStatus(TimeSpan? checkIn, int lateMinutes, int earlyLeaveMinutes)
        {
            if (checkIn is null) return "Absent";
            
            var statuses = new List<string>();
            if (lateMinutes > 0) statuses.Add("Late");
            if (earlyLeaveMinutes > 0) statuses.Add("EarlyLeave");
            
            return statuses.Count == 0 ? "Present" : string.Join(", ", statuses);
        }
    }
}
